// Helper function to fetch frontend content from database
export async function getFrontendContent(page: string, section: string, key: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/content?page=${page}&section=${section}`,
      {
        cache: 'no-store', // Always fetch fresh content
      }
    );

    if (response.ok) {
      const data = await response.json();
      const item = data.content?.find(
        (item: any) => item.page === page && item.section === section && item.key === key
      );
      
      if (item) {
        // Handle JSON values
        if (typeof item.value === 'object') {
          return JSON.stringify(item.value);
        }
        return item.value;
      }
    }
  } catch (error) {
    console.error(`Error fetching content for ${page}.${section}.${key}:`, error);
  }
  
  return null;
}

// Helper function to get all content for a page section
export async function getSectionContent(page: string, section: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/content?page=${page}&section=${section}`,
      {
        cache: 'no-store',
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content: Record<string, string> = {};
      
      data.content?.forEach((item: any) => {
        if (item.page === page && item.section === section) {
          if (typeof item.value === 'object') {
            content[item.key] = JSON.stringify(item.value);
          } else {
            content[item.key] = item.value;
          }
        }
      });
      
      return content;
    }
  } catch (error) {
    console.error(`Error fetching section content for ${page}.${section}:`, error);
  }
  
  return {};
}

