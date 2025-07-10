import axios from "axios";

interface BlogResponse {
  data: {
    id: number;
    attributes: {
      documentId: number;
      title: string;
      description: string;
    };
  }[];
}

interface Blog {
  documentId: number;
  title: string;
  description: string;
}

export async function fetchBlogs(): Promise<Blog[]> {
  try {
    const response = await axios.get<BlogResponse>(
      `${process.env.STRAPI_BASE_URL}/api/articles?fields[0]=title&fields[1]=description&fields[2]=documentId`
    );
    
    return response.data.data.map(item => ({
      documentId: item.attributes.documentId,
      title: item.attributes.title,
      description: item.attributes.description,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}