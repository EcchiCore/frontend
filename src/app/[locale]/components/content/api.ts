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
    const response = await fetch(
      `${process.env.STRAPI_BASE_URL}/api/articles?fields[0]=title&fields[1]=description&fields[2]=documentId`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as BlogResponse;
    
    return data.data.map((item: any) => ({
      documentId: item.attributes.documentId,
      title: item.attributes.title,
      description: item.attributes.description,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}