"""
RAG Service using LangChain, FAISS, and GPT4All
"""
import os
import pickle
from typing import List, Dict, Optional
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import GPT4All
from langchain.chains import RetrievalQA, LLMChain
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document


class RAGService:
    def __init__(self, 
                 persist_dir: str = "./storage",
                 model_path: str = "./models"):
        self.persist_dir = persist_dir
        self.model_path = model_path
        self.vectorstore = None
        self.embeddings = None
        self.llm = None
        self.textbook_name = None
        self.total_chunks = 0
        
        os.makedirs(persist_dir, exist_ok=True)
        os.makedirs(model_path, exist_ok=True)
        
        # Initialize embeddings
        self._initialize_embeddings()
    
    def _initialize_embeddings(self):
        """Initialize sentence-transformers embeddings"""
        print("Loading embeddings model (all-mpnet-base-v2)...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        print("Embeddings model loaded successfully!")
    
    def _initialize_llm(self):
        """Initialize GPT4All LLM"""
        if self.llm is None:
            print("Loading GPT4All-MPT model...")
            # Download model if not exists
            model_name = "orca-mini-3b-gguf2-q4_0.gguf"
            model_file = os.path.join(self.model_path, model_name)
            
            self.llm = GPT4All(
                model=model_file,
                max_tokens=2048,
                temp=0.7,
                n_ctx=2048,
                verbose=False
            )
            print("GPT4All model loaded successfully!")
    
    def create_vectorstore(self, chunks: List[Dict], textbook_name: str):
        """Create and persist FAISS vectorstore"""
        print(f"Creating vectorstore with {len(chunks)} chunks...")
        
        # Convert chunks to LangChain Documents
        documents = []
        for chunk in chunks:
            doc = Document(
                page_content=chunk['text'],
                metadata=chunk['metadata']
            )
            documents.append(doc)
        
        # Create FAISS vectorstore
        self.vectorstore = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        
        # Persist to disk
        vectorstore_path = os.path.join(self.persist_dir, "faiss_index")
        self.vectorstore.save_local(vectorstore_path)
        
        # Save metadata
        metadata = {
            'textbook_name': textbook_name,
            'total_chunks': len(chunks)
        }
        with open(os.path.join(self.persist_dir, "metadata.pkl"), 'wb') as f:
            pickle.dump(metadata, f)
        
        self.textbook_name = textbook_name
        self.total_chunks = len(chunks)
        
        print(f"Vectorstore created and persisted successfully!")
    
    def load_vectorstore(self):
        """Load existing vectorstore from disk"""
        vectorstore_path = os.path.join(self.persist_dir, "faiss_index")
        metadata_path = os.path.join(self.persist_dir, "metadata.pkl")
        
        if not os.path.exists(vectorstore_path):
            return False
        
        try:
            self.vectorstore = FAISS.load_local(
                vectorstore_path,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            
            with open(metadata_path, 'rb') as f:
                metadata = pickle.load(f)
                self.textbook_name = metadata['textbook_name']
                self.total_chunks = metadata['total_chunks']
            
            print(f"Vectorstore loaded: {self.textbook_name} ({self.total_chunks} chunks)")
            return True
        except Exception as e:
            print(f"Error loading vectorstore: {e}")
            return False
    
    def is_ready(self) -> bool:
        """Check if system is ready"""
        return self.vectorstore is not None
    
    def get_status(self) -> Dict:
        """Get system status"""
        return {
            'ready': self.is_ready(),
            'textbook_name': self.textbook_name,
            'total_chunks': self.total_chunks
        }
    
    def retrieve_context(self, query: str, k: int = 5) -> List[Document]:
        """Retrieve relevant chunks from vectorstore"""
        if not self.is_ready():
            raise ValueError("Vectorstore not initialized. Please upload a textbook first.")
        
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
        docs = retriever.get_relevant_documents(query)
        return docs
    
    def generate_summary(self, chapter: str) -> str:
        """Generate chapter summary"""
        self._initialize_llm()
        
        query = f"Chapter {chapter} summary main topics concepts"
        docs = self.retrieve_context(query, k=10)
        
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["context", "chapter"],
            template="""Based on the following content from Chapter {chapter}, create a comprehensive summary:

Context:
{context}

Please provide a detailed summary covering:
- Main topics and concepts
- Key points and important information
- Core ideas and themes

Summary:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        summary = chain.run(context=context, chapter=chapter)
        
        return summary.strip()
    
    def generate_concept_map(self, chapter: str) -> str:
        """Generate concept map"""
        self._initialize_llm()
        
        query = f"Chapter {chapter} concepts relationships hierarchy"
        docs = self.retrieve_context(query, k=10)
        
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["context", "chapter"],
            template="""Based on the following content from Chapter {chapter}, create a concept map showing relationships:

Context:
{context}

Create a hierarchical concept map in text format showing:
- Main concepts
- Sub-concepts
- Relationships between concepts
Use indentation to show hierarchy.

Concept Map:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        concept_map = chain.run(context=context, chapter=chapter)
        
        return concept_map.strip()
    
    def generate_tricks(self, chapter: str) -> str:
        """Generate mnemonics and tricks"""
        self._initialize_llm()
        
        query = f"Chapter {chapter} important concepts formulas definitions"
        docs = self.retrieve_context(query, k=8)
        
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["context", "chapter"],
            template="""Based on the following content from Chapter {chapter}, create memory tricks and mnemonics:

Context:
{context}

Provide:
- Mnemonics for important concepts
- Memory tricks
- Easy ways to remember key points
- Acronyms or rhymes if applicable

Tricks and Mnemonics:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        tricks = chain.run(context=context, chapter=chapter)
        
        return tricks.strip()
    
    def generate_qna(self, chapter: str) -> List[Dict[str, str]]:
        """Generate Q&A pairs"""
        self._initialize_llm()
        
        query = f"Chapter {chapter} key concepts important topics"
        docs = self.retrieve_context(query, k=8)
        
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["context", "chapter"],
            template="""Based on the following content from Chapter {chapter}, create 5 important question-answer pairs:

Context:
{context}

Generate 5 Q&A pairs in this exact format:
Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

(Continue for Q3, Q4, Q5)

Q&A:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        qna_text = chain.run(context=context, chapter=chapter)
        
        # Parse Q&A pairs
        qna_list = []
        lines = qna_text.split('\n')
        current_q = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('Q'):
                current_q = line.split(':', 1)[1].strip() if ':' in line else line
            elif line.startswith('A') and current_q:
                current_a = line.split(':', 1)[1].strip() if ':' in line else line
                qna_list.append({'question': current_q, 'answer': current_a})
                current_q = None
        
        return qna_list[:5]  # Return max 5
    
    def ask_question(self, question: str) -> Dict[str, any]:
        """Answer free-form question"""
        self._initialize_llm()
        
        docs = self.retrieve_context(question, k=5)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""Based on the following context, answer the question:

Context:
{context}

Question: {question}

Answer:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        answer = chain.run(context=context, question=question)
        
        sources = [f"Chunk {doc.metadata.get('chunk_id', 'unknown')}" for doc in docs[:3]]
        
        return {
            'answer': answer.strip(),
            'sources': sources
        }
