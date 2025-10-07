/**
 * API Integration for EduSummary Backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Upload textbook file
 * @param {File} file - The file to upload (PDF/PPT/DOCX)
 * @returns {Promise<Object>} Upload response
 */
export async function uploadTextbook(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get system status
 * @returns {Promise<Object>} Status response
 */
export async function getStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);

    if (!response.ok) {
      throw new Error('Failed to get status');
    }

    return await response.json();
  } catch (error) {
    console.error('Status error:', error);
    throw error;
  }
}

/**
 * Generate section outputs
 * @param {string} sectionId - Section ID
 * @param {string} option - 'summary', 'conceptmap', 'tricks', or 'all'
 * @returns {Promise<Object>} Generated content
 */
export async function generateChapter(sectionId, option) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ section_id: sectionId, option }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Generation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

/**
 * Ask a free-form question
 * @param {string} question - The question to ask
 * @returns {Promise<Object>} Answer response
 */
export async function askQuestion(question) {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Question failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Question error:', error);
    throw error;
  }
}
