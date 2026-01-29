import { notion, findDatabaseByTitle } from "./notion";

async function addOrderFields() {
    try {
        console.log("Adding Order fields to existing databases...");

        // List of databases that need Order fields
        const databases = ["Projects", "Work Experience", "Writing", "Speaking", "Education", "Contact"];
        
        for (const dbName of databases) {
            try {
                const database = await findDatabaseByTitle(dbName);
                if (!database) {
                    console.log(`Database ${dbName} not found, skipping`);
                    continue;
                }

                // Check if Order field already exists
                if (database.properties.Order) {
                    console.log(`Order field already exists in ${dbName}`);
                    continue;
                }

                // Add Order property to database
                await notion.databases.update({
                    database_id: database.id,
                    properties: {
                        ...database.properties,
                        Order: {
                            number: {}
                        }
                    }
                });

                console.log(`Added Order field to ${dbName} database`);

                // Now assign order numbers to existing entries
                const response = await notion.databases.query({
                    database_id: database.id,
                });

                for (let i = 0; i < response.results.length; i++) {
                    const page = response.results[i];
                    await notion.pages.update({
                        page_id: page.id,
                        properties: {
                            Order: {
                                number: i + 1
                            }
                        }
                    });
                    console.log(`Set order ${i + 1} for item in ${dbName}`);
                }

            } catch (error) {
                console.error(`Error updating ${dbName} database:`, error);
            }
        }

        console.log("Order fields setup complete!");
    } catch (error) {
        console.error("Error adding order fields:", error);
    }
}

addOrderFields().then(() => {
    console.log("Order fields setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Failed to add order fields:", error);
    process.exit(1);
});