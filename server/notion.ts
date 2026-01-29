import { Client } from "@notionhq/client";
import { processCollectionImages, getActiveImageFilenames, cleanupUnusedImages } from "./image-sync";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 */
export async function getNotionDatabases() {
    const childDatabases = [];

    try {
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });

            for (const block of response.results) {
                if ('type' in block && block.type === "child_database") {
                    const databaseId = block.id;

                    try {
                        const databaseInfo = await notion.databases.retrieve({
                            database_id: databaseId,
                        });

                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
                }
            }

            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

// Find a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        const dbAny = db as any;
        if (dbAny.title && Array.isArray(dbAny.title) && dbAny.title.length > 0) {
            const dbTitle = dbAny.title[0]?.plain_text?.toLowerCase() || "";
            if (dbTitle === title.toLowerCase()) {
                return db;
            }
        }
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: NOTION_PAGE_ID
        },
        title: [
            {
                type: "text",
                text: {
                    content: title
                }
            }
        ],
        properties
    });
}

// Get portfolio general information
export async function getPortfolioGeneral() {
    try {
        const generalDb = await findDatabaseByTitle("General");
        if (!generalDb) return null;

        const response = await notion.databases.query({
            database_id: generalDb.id,
        });

        if (response.results.length === 0) return null;

        const page: any = response.results[0];
        const props = page.properties;

        return {
            profilePhoto: props.ProfilePhoto?.files?.[0]?.file?.url || props.ProfilePhoto?.files?.[0]?.external?.url || "/content/media/profilePhoto.jpg",
            displayName: props.DisplayName?.title?.[0]?.plain_text || "Portfolio",
            byline: props.Byline?.rich_text?.[0]?.plain_text || "",
            website: props.Website?.url || "",
            about: props.About?.rich_text?.[0]?.plain_text || "",
        };
    } catch (error) {
        console.error("Error fetching general info:", error);
        return null;
    }
}

// Get all projects from Notion
export async function getProjects() {
    try {
        const projectsDb = await findDatabaseByTitle("Projects");
        if (!projectsDb) return [];

        // Try to sort by Order field, fall back to no sorting if field doesn't exist
        let queryParams: any = {
            database_id: projectsDb.id
        };
        
        if (projectsDb.properties.Order) {
            queryParams.sorts = [
                {
                    property: "Order", 
                    direction: "ascending"
                }
            ];
        }

        const response = await notion.databases.query(queryParams);

        return response.results.map((page: any) => {
            const props = page.properties;
            
            // Get attachments from the page content
            const attachments = props.Attachments?.files?.map((file: any) => ({
                type: "image",
                width: 1920,  // Default width - will be updated by frontend when image loads
                height: 1080, // Default height - will be updated by frontend when image loads
                url: file.file?.url || file.external?.url
            })) || [];

            return {
                id: page.id,
                year: props.Year?.number?.toString() || props.Year?.rich_text?.[0]?.plain_text || "2024",
                heading: props.Title?.title?.[0]?.plain_text || "Untitled Project",
                url: props.URL?.url || null,
                description: props.Description?.rich_text?.[0]?.plain_text || "",
                attachments,
                type: "project",
                title: props.Title?.title?.[0]?.plain_text || "Untitled Project",
                company: props.Company?.rich_text?.[0]?.plain_text || ""
            };
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

// Get work experience data
export async function getWorkExperience() {
    try {
        const workDb = await findDatabaseByTitle("Work Experience");
        if (!workDb) return [];

        // Try to sort by Order field, fall back to no sorting if field doesn't exist
        let queryParams: any = {
            database_id: workDb.id
        };
        
        if (workDb.properties.Order) {
            queryParams.sorts = [
                {
                    property: "Order", 
                    direction: "ascending"
                }
            ];
        }

        const response = await notion.databases.query(queryParams);

        return response.results.map((page: any) => {
            const props = page.properties;
            
            return {
                id: page.id,
                year: props.Year?.rich_text?.[0]?.plain_text || "2024",
                heading: `${props.Title?.title?.[0]?.plain_text || "Position"} at ${props.Company?.rich_text?.[0]?.plain_text || "Company"}`,
                title: props.Title?.title?.[0]?.plain_text || "Position",
                company: props.Company?.rich_text?.[0]?.plain_text || "Company",
                location: props.Location?.rich_text?.[0]?.plain_text || null,
                description: props.Description?.rich_text?.[0]?.plain_text || "",
                attachments: [],
                type: "workExperience"
            };
        });
    } catch (error) {
        console.error("Error fetching work experience:", error);
        return [];
    }
}

// Sync all portfolio data with local image storage
export async function syncPortfolioWithImages() {
    console.log('Starting portfolio sync with image downloads...');
    
    try {
        // Fetch all data from Notion
        const [general, projects, workExperience, writing, speaking, education, contact] = await Promise.all([
            getPortfolioGeneral(),
            getProjects(),
            getWorkExperience(),
            getSection("Writing"),
            getSection("Speaking"), 
            getSection("Education"),
            getContact()
        ]);

        // Process images for each collection
        const [
            projectsWithImages,
            workExperienceWithImages,
            writingWithImages,
            speakingWithImages,
            educationWithImages
        ] = await Promise.all([
            processCollectionImages(projects, 'projects'),
            processCollectionImages(workExperience, 'workExperience'),
            processCollectionImages(writing, 'writing'),
            processCollectionImages(speaking, 'speaking'),
            processCollectionImages(education, 'education')
        ]);

        // Collect all download statistics
        const allDownloadedImages = [
            ...projectsWithImages.downloadedImages,
            ...workExperienceWithImages.downloadedImages,
            ...writingWithImages.downloadedImages,
            ...speakingWithImages.downloadedImages,
            ...educationWithImages.downloadedImages
        ];

        // Create final portfolio data with processed images
        const portfolioData = {
            general,
            projects: projectsWithImages.items,
            workExperience: workExperienceWithImages.items,
            writing: writingWithImages.items,
            speaking: speakingWithImages.items,
            education: educationWithImages.items,
            contact: contact // Contact doesn't need image processing
        };

        // Clean up unused images
        const activeImages = getActiveImageFilenames(portfolioData);
        await cleanupUnusedImages(activeImages);

        // Log sync results
        const successfulDownloads = allDownloadedImages.filter(img => img.downloaded).length;
        const failedDownloads = allDownloadedImages.filter(img => !img.downloaded).length;
        
        console.log(`Image sync complete: ${successfulDownloads} downloaded, ${failedDownloads} failed`);
        
        return {
            portfolioData,
            syncStats: {
                totalImages: allDownloadedImages.length,
                downloaded: successfulDownloads,
                failed: failedDownloads,
                cleaned: activeImages.length
            }
        };
    } catch (error) {
        console.error('Error during portfolio sync:', error);
        throw error;
    }
}

// Get other sections (writing, speaking, etc.)
export async function getSection(sectionName: string) {
    try {
        const sectionDb = await findDatabaseByTitle(sectionName);
        if (!sectionDb) return [];

        // Try to sort by Order field, fall back to no sorting if field doesn't exist
        let queryParams: any = {
            database_id: sectionDb.id
        };
        
        if (sectionDb.properties.Order) {
            queryParams.sorts = [
                {
                    property: "Order", 
                    direction: "ascending"
                }
            ];
        }

        const response = await notion.databases.query(queryParams);

        return response.results.map((page: any) => {
            const props = page.properties;
            
            // Process attachments if they exist
            let attachments = [];
            if (props.Attachments?.files) {
                attachments = props.Attachments.files.map((file: any) => ({
                    type: "image",
                    width: 1920,  // Default width - will be updated by frontend when image loads
                    height: 1080, // Default height - will be updated by frontend when image loads
                    url: file.file?.url || file.external?.url || ""
                })).filter((attachment: any) => attachment.url);
            }
            
            return {
                id: page.id,
                year: props.Year?.number?.toString() || props.Year?.rich_text?.[0]?.plain_text || "2024",
                heading: props.Title?.title?.[0]?.plain_text || "Untitled",
                url: props.URL?.url || null,
                description: props.Description?.rich_text?.[0]?.plain_text || "",
                location: props.Location?.rich_text?.[0]?.plain_text || null,
                attachments,
                type: sectionName.toLowerCase().replace(/\s+/g, '_')
            };
        });
    } catch (error) {
        console.error(`Error fetching ${sectionName}:`, error);
        return [];
    }
}

export async function getContact() {
    try {
        const contactDb = await findDatabaseByTitle("Contact");
        if (!contactDb) {
            console.log("No Contact database found");
            return [];
        }

        // Try to sort by Order field, fall back to no sorting if field doesn't exist
        let queryParams: any = {
            database_id: contactDb.id
        };
        
        if (contactDb.properties.Order) {
            queryParams.sorts = [
                {
                    property: "Order", 
                    direction: "ascending"
                }
            ];
        }

        const response = await notion.databases.query(queryParams);

        return response.results.map((page: any) => {
            const props = page.properties;
            return {
                id: page.id,
                platform: props.Platform?.title?.[0]?.plain_text || "",
                handle: props.Handle?.rich_text?.[0]?.plain_text || "",
                url: props.URL?.url || "",
                type: "contact"
            };
        });
    } catch (error) {
        console.error("Error fetching Contact:", error);
        return [];
    }
}