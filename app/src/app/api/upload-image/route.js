import { currentUser } from '@clerk/nextjs/server';
import { createHash } from 'node:crypto';

export const runtime = 'nodejs';

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'blog-posts';

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary environment variables');
  }

  return { cloudName, apiKey, apiSecret, folder };
}

export async function POST(req) {
  const user = await currentUser();

  if (!user || user.publicMetadata.isAdmin !== true) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
    const requestFormData = await req.formData();
    const image = requestFormData.get('image');

    if (!(image instanceof File)) {
      return Response.json({ message: 'Image file is required' }, { status: 400 });
    }

    if (!image.type?.startsWith('image/')) {
      return Response.json({ message: 'Only image files are allowed' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append('file', image);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return Response.json(
        { message: uploadResult?.error?.message || 'Upload failed' },
        { status: uploadResponse.status }
      );
    }

    return Response.json({ url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return Response.json({ message: 'Image upload failed' }, { status: 500 });
  }
}
