import axios from "axios";
import Link from "next/link";
import { JSX } from "react";

interface Blog {
  documentId: number;
  title: string;
  description: string;
  slug: string;
  // ... other properties from your API response
}

const fetchBlogs = async (): Promise<Blog[] | string> => {
  try {
    const response = await axios.get<{ data: Blog[] }>(
      `${process.env.STRAPI_BASE_URL}/api/articles`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return "Sorry, we couldn't load the blogs at this time. Please try again later.";
  }
};

export default async function Page(): Promise<JSX.Element> {
  const blogs = await fetchBlogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Latest Blog Posts</h1>
      {typeof blogs === 'string' ? ( // Check if blogs is a string (error message)
        <div className="text-center text-red-600">
          {blogs} {/* Display the error message */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.documentId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{blog.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.description}</p>
                <div className="flex justify-between items-center">
                  <Link href={`/blog/${blog.documentId}`} className="text-blue-500 hover:text-blue-600 transition duration-300">
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
