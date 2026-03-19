import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const CATEGORY_MAP = {
  'con-nguoi': 'people',
  'dong-vat': 'animals',
  'cay-coi': 'plants',
  'moi-truong': 'environment',
  'doi-song': 'lifestyle',
  'khoa-hoc': 'science',
  'van-hoa': 'culture',
  'suc-khoe': 'health',
};

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function run() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const shouldExecute = process.argv.includes('--execute');
  const [{ connect }, { default: Post }] = await Promise.all([
    import('../src/lib/mongodb/mongoose.js'),
    import('../src/lib/models/post.model.js'),
  ]);

  await connect();

  const legacyCategories = Object.keys(CATEGORY_MAP);
  const posts = await Post.find(
    { category: { $in: legacyCategories } },
    '_id title category slug'
  ).lean();

  if (posts.length === 0) {
    console.log('No legacy categories found. Nothing to migrate.');
    return;
  }

  console.log(`Found ${posts.length} posts with legacy categories.`);

  for (const post of posts) {
    console.log(
      `- ${post._id} | ${post.category} -> ${CATEGORY_MAP[post.category]} | ${post.title}`
    );
  }

  if (!shouldExecute) {
    console.log('');
    console.log('Dry run only. No database changes were made.');
    console.log('Run again with --execute to apply the migration.');
    return;
  }

  let updatedCount = 0;

  for (const [oldCategory, newCategory] of Object.entries(CATEGORY_MAP)) {
    const result = await Post.updateMany(
      { category: oldCategory },
      { $set: { category: newCategory } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Updated ${result.modifiedCount} posts: ${oldCategory} -> ${newCategory}`);
    }

    updatedCount += result.modifiedCount;
  }

  console.log('');
  console.log(`Migration completed. Updated ${updatedCount} posts.`);
}

run()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error);
    }
  });
