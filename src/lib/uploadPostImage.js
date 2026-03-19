export function uploadPostImage(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-image');
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    xhr.onload = () => {
      const response = xhr.response;

      if (xhr.status >= 200 && xhr.status < 300 && response?.url) {
        resolve(response.url);
        return;
      }

      reject(new Error(response?.message || 'Image upload failed'));
    };

    xhr.onerror = () => {
      reject(new Error('Image upload failed'));
    };

    xhr.send(formData);
  });
}
