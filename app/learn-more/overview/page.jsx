export default function overviewPage() {
    return(
    <main className="learn-more-file">
    <h2>Fire Danger Levels</h2>
            <p>The National Fire Danger Rating System uses five distinct levels to indicate wildfire risk. These levels are often shown on color-coded dials in parks and wildland areas.</p>

            <h2 className="fire-danger-low">Fire Danger Level: Low</h2>
            <p>When the fire danger is "low" it means that fuels do not ignite easily from small embers, but a more intense heat source, such as lightning, may start fires in duff or dry rotten wood. Fires in open, dry grasslands may burn easily a few hours after a rain, but most wood fires will spread slowly, creeping or smoldering. Control of fires is generally easy.</p>

            <h2 className="fire-danger-moderate">Fire Danger Level: Moderate</h2>
            <p>When the fire danger is "moderate" it means that fires can start from most accidental causes, but the number of fire starts is usually pretty low. If a fire does start in an open, dry grassland, it will burn and spread quickly on windy days. Most wood fires will spread slowly to moderately. Average fire intensity will be moderate except in heavy concentrations of fuel, which may burn hot. Fires are still not likely to become serious and are often easy to control.</p>

            <h2 className="fire-danger-high">Fire Danger Level: High</h2>
            <p>When the fire danger is "high", fires can start easily from most causes and small fuels (such as grasses and needles) will ignite readily. Unattended campfires and brush fires are likely to escape. Fires will spread easily, with some areas of high-intensity burning on slopes or concentrated fuels. Fires can become serious and difficult to control unless they are put out while they are still small.</p>

            <h2 className="fire-danger-very-high">Fire Danger Level: Very High</h2>
            <p>When the fire danger is "very high", fires will start easily from most causes. The fires will spread rapidly and have a quick increase in intensity, right after ignition. Small fires can quickly become large fires and exhibit extreme fire intensity, such as long-distance spotting and fire whirls. These fires can be difficult to control and will often become much larger and longer-lasting fires.</p>

            <h2 className="fire-danger-extreme">Fire Danger Level: Extreme</h2>
            <p>When the fire danger is "extreme", fires of all types start quickly and burn intensely. All fires are potentially serious and can spread very quickly with intense burning. Small fires become big fires much faster than at the "very high" level. Spot fires are probable, with long-distance spotting likely. These fires are very difficult to fight and may become very dangerous and often last for several days.</p>
    </main>
    );
}