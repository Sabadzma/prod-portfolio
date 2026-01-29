import { createDatabaseIfNotExists, findDatabaseByTitle, notion } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
}

async function setupNotionDatabases() {
    console.log("Setting up Notion databases...");

    // Create General Information database
    await createDatabaseIfNotExists("General", {
        DisplayName: {
            title: {}
        },
        Byline: {
            rich_text: {}
        },
        Website: {
            url: {}
        },
        About: {
            rich_text: {}
        },
        ProfilePhoto: {
            files: {}
        }
    });

    // Create Projects database
    await createDatabaseIfNotExists("Projects", {
        Title: {
            title: {}
        },
        Year: {
            number: {}
        },
        Company: {
            rich_text: {}
        },
        Description: {
            rich_text: {}
        },
        URL: {
            url: {}
        },
        Attachments: {
            files: {}
        },
        Status: {
            select: {
                options: [
                    { name: "Published", color: "green" },
                    { name: "Draft", color: "yellow" },
                    { name: "Archived", color: "gray" }
                ]
            }
        }
    });

    // Create Writing database
    await createDatabaseIfNotExists("Writing", {
        Title: {
            title: {}
        },
        Year: {
            number: {}
        },
        Description: {
            rich_text: {}
        },
        URL: {
            url: {}
        },
        Platform: {
            select: {
                options: [
                    { name: "Medium", color: "green" },
                    { name: "Blog", color: "blue" },
                    { name: "Publication", color: "purple" }
                ]
            }
        }
    });

    // Create Speaking database
    await createDatabaseIfNotExists("Speaking", {
        Title: {
            title: {}
        },
        Year: {
            number: {}
        },
        Description: {
            rich_text: {}
        },
        Location: {
            rich_text: {}
        },
        URL: {
            url: {}
        },
        Event: {
            rich_text: {}
        },
        Attachments: {
            files: {}
        }
    });

    // Create Education database
    await createDatabaseIfNotExists("Education", {
        Title: {
            title: {}
        },
        Year: {
            number: {}
        },
        Institution: {
            rich_text: {}
        },
        Description: {
            rich_text: {}
        },
        Location: {
            rich_text: {}
        }
    });

    // Create Contact database
    await createDatabaseIfNotExists("Contact", {
        Platform: {
            title: {}
        },
        Handle: {
            rich_text: {}
        },
        URL: {
            url: {}
        },
        Order: {
            number: {}
        }
    });

    console.log("Databases created successfully!");
}

async function createSampleData() {
    try {
        console.log("Adding sample data...");

        // Find the databases
        const generalDb = await findDatabaseByTitle("General");
        const projectsDb = await findDatabaseByTitle("Projects");
        const writingDb = await findDatabaseByTitle("Writing");
        const speakingDb = await findDatabaseByTitle("Speaking");
        const contactDb = await findDatabaseByTitle("Contact");

        if (!generalDb || !projectsDb || !writingDb || !speakingDb || !contactDb) {
            throw new Error("Could not find the required databases.");
        }

        // Add general information
        await notion.pages.create({
            parent: {
                database_id: generalDb.id
            },
            properties: {
                DisplayName: {
                    title: [
                        {
                            text: {
                                content: "Saba Chitaishvili"
                            }
                        }
                    ]
                },
                Byline: {
                    rich_text: [
                        {
                            text: {
                                content: "Design Systems Enthusiast"
                            }
                        }
                    ]
                },
                Website: {
                    url: "https://medium.com/@saba.chitaishvili"
                },
                About: {
                    rich_text: [
                        {
                            text: {
                                content: "👋 Hi, I'm Saba — a product designer specializing in design systems, with hands-on experience in setting up system foundations, mapping their structures, and setting up governance models."
                            }
                        }
                    ]
                }
            }
        });

        // Add sample project
        await notion.pages.create({
            parent: {
                database_id: projectsDb.id
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: "Implemented design tokens system at TBC"
                            }
                        }
                    ]
                },
                Year: {
                    number: 2024
                },
                Company: {
                    rich_text: [
                        {
                            text: {
                                content: "TBC"
                            }
                        }
                    ]
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: "The project established a single source of truth with tools that translate JSON design tokens into formats for Figma, CSS, Sass, Kotlin, and Swift."
                            }
                        }
                    ]
                },
                Status: {
                    select: {
                        name: "Published"
                    }
                }
            }
        });

        // Add sample writing
        await notion.pages.create({
            parent: {
                database_id: writingDb.id
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: "Building a Color System with Accessibility in Mind"
                            }
                        }
                    ]
                },
                Year: {
                    number: 2023
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: "A comprehensive guide to creating accessible and scalable color systems for design systems."
                            }
                        }
                    ]
                },
                URL: {
                    url: "https://medium.com/tbc-design/building-a-color-system-with-accessibility-and-scalability-in-mind-1a8fd44fb44b"
                },
                Platform: {
                    select: {
                        name: "Medium"
                    }
                }
            }
        });

        // Add sample speaking
        await notion.pages.create({
            parent: {
                database_id: speakingDb.id
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: "Creating and maintaining design systems"
                            }
                        }
                    ]
                },
                Year: {
                    number: 2023
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: "Workshop on design system fundamentals and best practices."
                            }
                        }
                    ]
                },
                Location: {
                    rich_text: [
                        {
                            text: {
                                content: "Tbilisi, Georgia"
                            }
                        }
                    ]
                },
                Event: {
                    rich_text: [
                        {
                            text: {
                                content: "Tbilisi Design Festival"
                            }
                        }
                    ]
                }
            }
        });

        // Add contact information
        const contactEntries = [
            {
                platform: "LinkedIn",
                handle: "@saba-chitaishvili",
                url: "https://linkedin.com/in/saba-chitaishvili"
            },
            {
                platform: "Medium",
                handle: "@saba.chitaishvili",
                url: "https://medium.com/@saba.chitaishvili"
            },
            {
                platform: "Email",
                handle: "hello@sabachitaishvili.com",
                url: "mailto:hello@sabachitaishvili.com"
            }
        ];

        for (let contact of contactEntries) {
            await notion.pages.create({
                parent: {
                    database_id: contactDb.id
                },
                properties: {
                    Platform: {
                        title: [
                            {
                                text: {
                                    content: contact.platform
                                }
                            }
                        ]
                    },
                    Handle: {
                        rich_text: [
                            {
                                text: {
                                    content: contact.handle
                                }
                            }
                        ]
                    },
                    URL: {
                        url: contact.url
                    }
                }
            });
        }

        console.log("Sample data creation complete.");
    } catch (error) {
        console.error("Error creating sample data:", error);
    }
}

// Run the setup
setupNotionDatabases().then(() => {
    return createSampleData();
}).then(() => {
    console.log("Notion CMS setup complete!");
    console.log("You can now edit your portfolio content directly in Notion.");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});