import { notion, findDatabaseByTitle } from "./notion";

async function addContactData() {
    try {
        console.log("Adding contact data...");

        // Find the Contact database
        const contactDb = await findDatabaseByTitle("Contact");
        if (!contactDb) {
            throw new Error("Contact database not found");
        }

        // Add contact information
        const contactEntries = [
            {
                platform: "LinkedIn",
                handle: "@saba-chitaishvili",
                url: "https://linkedin.com/in/saba-chitaishvili",
                order: 1
            },
            {
                platform: "Medium",
                handle: "@saba.chitaishvili",
                url: "https://medium.com/@saba.chitaishvili",
                order: 2
            },
            {
                platform: "Email",
                handle: "hello@sabachitaishvili.com",
                url: "mailto:hello@sabachitaishvili.com",
                order: 3
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
                    },
                    Order: {
                        number: contact.order
                    }
                }
            });
            console.log(`Added contact: ${contact.platform}`);
        }

        console.log("Contact data added successfully!");
    } catch (error) {
        console.error("Error adding contact data:", error);
    }
}

addContactData().then(() => {
    console.log("Contact data setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Failed to add contact data:", error);
    process.exit(1);
});