import api from "./api";

// Upload single image
export const uploadSingleImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
        const response = await api.post('uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Return the response in a consistent format
        return {
            success: true,
            data: response.data,
            status: response.status,
            // Extract common URL patterns and add them to the response
            fileUrl: response.data?.fileUrl || 
                     response.data?.url || 
                     response.data?.path || 
                     response.data?.filename ||
                     response.data?.imagePath ||
                     response.data?.imageUrl ||
                     response.data?.file ||
                     response.data?.location ||
                     (typeof response.data === 'string' ? response.data : ''),
            originalResponse: response
        };
    } catch (error) {
        throw error;
    }
};

// Alternative upload function that tries different endpoints
export const uploadSingleImageAlt = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile); // Some APIs expect 'file' instead of 'image'
    
    try {
        const response = await api.post('upload', formData, { // Try 'upload' instead of 'uploads/image'
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return {
            success: true,
            data: response.data,
            fileUrl: response.data?.fileUrl || response.data?.url || response.data?.path || '',
            originalResponse: response
        };
    } catch (error) {
        throw error;
    }
};

// Upload with multiple field name attempts
export const uploadSingleImageMultiAttempt = async (imageFile) => {
    const endpoints = ['uploads/image', 'upload', 'api/upload'];
    const fieldNames = ['image', 'file', 'photo'];
    
    for (const endpoint of endpoints) {
        for (const fieldName of fieldNames) {
            try {
                const formData = new FormData();
                formData.append(fieldName, imageFile);
                
                const response = await api.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                return {
                    success: true,
                    data: response.data,
                    endpoint: endpoint,
                    fieldName: fieldName,
                    fileUrl: response.data?.fileUrl || 
                             response.data?.url || 
                             response.data?.path || 
                             response.data?.filename ||
                             response.data?.imagePath ||
                             response.data?.imageUrl ||
                             response.data?.file ||
                             response.data?.location ||
                             (typeof response.data === 'string' ? response.data : ''),
                    originalResponse: response
                };
            } catch (error) {
                // Continue to next attempt
            }
        }
    }
    
    throw new Error('All upload attempts failed. Please check your backend upload configuration.');
};

// Validate file function
export const validateFile = (file, type = 'image') => {
    const validation = {
        isValid: true,
        errors: []
    };

    if (!file) {
        validation.isValid = false;
        validation.errors.push('No file selected');
        return validation;
    }

    // File size validation (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        validation.isValid = false;
        validation.errors.push('File size must be less than 5MB');
    }

    // File type validation for images
    if (type === 'image') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            validation.isValid = false;
            validation.errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
        }
    }

    return validation;
};

// Get file preview URL
export const getFilePreviewUrl = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
};

// Format file size for display
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Test upload function for debugging
export const testUploadEndpoint = async () => {
    try {
        // Create a small test file
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        
        const endpoints = ['uploads/image', 'upload', 'api/upload', 'files/upload'];
        
        for (const endpoint of endpoints) {
            try {
                const formData = new FormData();
                formData.append('image', testFile);
                
                const response = await api.post(endpoint, formData);
                return { endpoint, working: true, response: response.data };
            } catch (error) {
                // Continue to next endpoint
            }
        }
        
        return { working: false, message: 'No working endpoints found' };
    } catch (error) {
        return { working: false, error: error.message };
    }
};