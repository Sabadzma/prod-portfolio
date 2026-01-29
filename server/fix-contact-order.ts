import { notion, findDatabaseByTitle } from "./notion";

async function fixContactOrder() {
    try {
        console.log("Adding Order field to Contact database...");

        const contactDb = await findDatabaseByTitle("Contact");
        if (!contactDb) {
            throw new Error("Contact database not found");
        }

        // Add Order property to Contact database
        await notion.databases.update({
            database_id: contactDb.id,
            properties: {
                ...contactDb.properties,
                Order: {
                    number: {}
                }
            }
        });

        console.log("Added Order field to Contact database");

        // Get all contact entries and assign order numbers
        const response = await notion.databases.query({
            database_id: contactDb.id,
        });

        console.log(`Found ${response.results.length} contact entries to update`);

        // Define the desired order for contact entries
        const orderMapping: { [key: string]: number } = {
            "LinkedIn": 1,
            "Medium": 2, 
            "Email": 3,
            "X": 4,
            "Dribbble": 5
        };

        for (const page of response.results) {
            const props = (page as any).properties;
            const platform = props.Platform?.title?.[0]?.plain_text || "";
            const order = orderMapping[platform] || 99;

            await notion.pages.update({
                page_id: page.id,
                properties: {
                    Order: {
                        number: order
                    }
                }
            });
            
            console.log(`Set order ${order} for ${platform}`);
        }

        console.log("Contact order setup complete!");
    } catch (error) {
        console.error("Error fixing contact order:", error);
    }
}

fixContactOrder().then(() => {
    console.log("Contact order fix complete!");
    process.exit(0);
}).catch(error => {
    console.error("Failed to fix contact order:", error);
    process.exit(1);
});