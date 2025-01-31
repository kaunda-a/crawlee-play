import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Define the directory where your Markdown files are stored
const postsDirectory = path.join(process.cwd(), 'posts'); // Ensure this path is correct

// Define the PostData interface to type the post data
export interface PostData {
  id: string;
  title: string;
  date: string;
  headerImage?: string;
  tags?: string[];
  contentHtml?: string;
}

// Function to get sorted posts data
export function getSortedPostsData(): PostData[] {
  // Read the filenames from the posts directory
  const fileNames = fs.readdirSync(postsDirectory);

  // Map over the filenames to create an array of PostData
  const allPostsData: PostData[] = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, ''); // Remove the .md extension
    const fullPath = path.join(postsDirectory, fileName); // Get the full path to the file

    // Check if the path is a file
    if (fs.statSync(fullPath).isFile()) {
      const fileContents = fs.readFileSync(fullPath, 'utf8'); // Read the file content
      const matterResult = matter(fileContents); // Parse the front matter

      return {
        id,
        ...matterResult.data, // Spread the front matter data
      } as PostData;
    } else {
      console.warn(`${fullPath} is not a file.`); // Log a warning if it's not a file
      return null; // Return null for non-file entries
    }
  }).filter(Boolean) as PostData[]; // Filter out any null values

  // Sort the posts by date in descending order
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Function to get post data by ID
export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`); // Get the full path to the Markdown file
  const fileContents = fs.readFileSync(fullPath, 'utf8'); // Read the file content
  const matterResult = matter(fileContents); // Parse the front matter

  // Process the Markdown content to HTML
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString(); // Convert to string

  return {
    id,
    contentHtml,
    ...matterResult.data, // Spread the front matter data
  } as PostData;
}