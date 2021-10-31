import { isValidUrl, openLinkInNewTab } from '../common/CommonFunctions';
import server from './server';

export const uploadFile = async (file, meetingId, uploaderId) => {
  const res = await server.get(`/uploads/write/${meetingId}`, {
    params: { name: file.name, type: file.type, uploader: uploaderId },
    headers: {
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
  const signedUrl = res.data.uploadUrl;
  await uploadToS3(signedUrl, file);
  return file.name;
};

const uploadToS3 = async (signedUrl, file) => {
  if (signedUrl) {
    return fetch(signedUrl, {
      headers: {
        'Content-Type': file.type,
      },
      method: 'PUT',
      body: file,
    }).catch((err) => {
      console.error('Image upload failed');
      throw err;
    });
  }
};

export const openFile = async (file, meetingId, uploaderId) => {
  if (isValidUrl(file)) {
    return openLinkInNewTab(file);
  }

  const res = await server.get(`/uploads/read/${meetingId}`, {
    params: { name: file, uploader: uploaderId },
    headers: {
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
  const downloadUrl = res.data;
  return openLinkInNewTab(downloadUrl);
};
