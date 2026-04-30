export default function nfdrsPage() {
    return(
    <main className="learn-more-file">
    <h2>National Fire Danger Rating System (NFDRS)</h2>

            <h3>History</h3>
            <p>The United States started researching fire danger after major fires in 1910. By the 1930s-50s, various systems used local environmental data like temperature, humidity, wind, and fuel amounts. In 1958, standardization began for a nationwide rating system that assessed ignition, fire spread, and fuel risks; the Timber Spread Index was an early attempt in the 1960s. By 1968, work shifted to developing scientifically consistent methods, leading to the NFDRS in 1972 with lookup tables. Since 1974, five risk levels and colors have helped inform the public about wildfire danger. Advances in technology and software now streamline NFDRS calculations.</p>

            <h3>How the System Works</h3>
            <p>The National Fire Danger Rating System uses five distinct levels to indicate wildfire risk. These levels are often shown on color-coded dials in parks and wildland areas, with an arrow marking the current fire danger. As a result, the public can easily gauge wildfire risk based on local weather and environmental conditions. For example, visitors should check the displayed fire danger level before starting a campfire. If the level is High or above, consider using camp stoves instead of open fires. Forest workers may need to delay using equipment that could spark, such as chainsaws or welding tools, until conditions improve. Homeowners are encouraged to postpone burning yard debris until fire danger drops to Moderate or Low. When fire danger is rated as Extreme or Very High, activities like campfires, welding, debris burning, and chainsaw use are generally not recommended. Fire restrictions are likely to be in effect during these times. If fire danger is High, exercise extreme caution during any activity that could start a fire and always check local guidelines for restrictions. No matter the fire danger category, anyone burning or using spark-producing equipment should carry a fire extinguisher, a shovel, and water.</p>
            <section className="doc-section">
                <h3>Fire Danger Levels</h3>
                <h4 className="fire-danger-low">Low (Green)</h4>
                <p>Fires are unlikely to start under these weather and fuel conditions without intense heat sources. Any fires that start will spread slowly, remain at a low intensity, and be reasonably easy to control and extinguish.</p>

                <h4 className="fire-danger-moderate">Moderate (Blue)</h4>
                <p>Some wildfires may ignite at moderate size and intensity. Controlling wildfires at this level is not difficult. Light to moderate mop up will be enough to manage these fires. Controlled burns can be performed under these conditions but should be executed cautiously.</p>

                <h4 className="fire-danger-high">High (Yellow)</h4>
                <p>Weather and fuel conditions mean that wildfires are likely. Wildfires in areas with heavy, continuous fuel, such as mature grassland, fields, and forest litter, will be hard to control if there are high winds. Directly attacking the fire may be difficult. Careful mop up is essential.</p>

                <h4 className="fire-danger-very-high">Very High (Orange)</h4>
                <p>Fires will start easily, and suppression efforts may not be able to keep up with the spread. Flames will be large, intense, and hard to control. Containment, suppression, and mop up will take a lot of work. Outdoor burns are not recommended.</p>

                <h4 className="fire-danger-extreme">Extreme (Red)</h4>
                <p>Wildfires can start and spread quickly under these conditions. Any fire has the potential to become huge and uncontrollable. Fire behavior is likely to be extreme and erratic. Hence, there should not be any outdoor burns if fire danger in the area is extreme.</p>
            </section>

            <h3>Wildfire Indicators</h3>
            <p>We have developed a wildfire indicator system that expands beyond traditional indices like ERC and BI to include five additional key factors: temperature (high and low), humidity (high and low), 1000-hour fuel moisture, and wind. ERC offers long-range forecasts, while BI responds to immediate weather systems, but other parameters such as evening humidity recovery and 1000-hour fuel dryness also affect fire risk. If any of these indices exceed local 90th percentile thresholds, they are highlighted in pink, signaling high fire potential. When three or more of the seven indicators are triggered, greater vigilance is recommended, as conditions may significantly increase wildfire spread and activity. This multi-factor approach ensures a comprehensive assessment of fire danger and timely alerts for elevated risks.</p>

            <h3>Pocket Cards</h3>
            <p>The Fire Danger Pocket Card provides a format for interpreting and communicating key index values provided by the National Fire Danger Rating System. The objective is to lead to greater awareness of fire danger and subsequently increased firefighter safety. The Pocket Card provides a description of seasonal changes in fire danger in a local area. It is useful to both local and out-of-area firefighters.</p>
            <p>The Pocket Card has very important day-to-day pre-suppression uses. When the morning and afternoon weather is ready each day, the actual and predicted indices are announced. Firefighters can reference their card and assess where today falls in the range of historical values for danger-rating. This important information should be discussed at morning crew meetings, tailgate safety meetings, incident briefings, etc.</p>
            <p>Local fire management personnel can produce the cards using Fire Family Plus. Cards should be developed locally with local fire management involvement to meet local fire management needs.</p>

            <h3>Fire Danger Breakpoints</h3>
            <p>Fire danger breakpoints are determined using indices like ERC, BI, and KBDI, depending on the region and fuel type. Areas may use one or multiple indices—ERC and BI together in a matrix, for example—to assess fire danger levels based on weather and historical fire data. Weather station records mostly start from 2004 due to prior issues with data quality, so both weather and fire history used in analyses cover the past 19 years and are updated regularly. The Fire Environment Mapping System and Fire Family Plus modeling help evaluate which indices best predict fire danger levels, ensuring accuracy by aligning fire history with reliable weather data.</p>

            <h3>NFDRS Flowchart</h3>
            <p>The National Fire Danger Rating System (NFDRS) flow chart shows that blue items are weather station inputs, while green items below represent indices calculated from these parameters. For example, the fuel moisture (1-Hr, 10Hr, 100Hr, 1000hr) boxes are derived from relative humidity, temperature, solar radiation, rainfall, and stick states. Fuel model weighting depends on your selected fire danger rating area; for instance, fuel model X (brush) using both live and dead fuels, unlike fuel model Y which excludes live fuels. The red boxes are NFDRS outputs such as Ignition Component (chances of ignition), Spread Component (fire spread likelihood), Burning Index (potential flame intensity), and Energy Release Component (heat released). At the bottom, orange and white boxes relate to staffing and preparedness plans, informing federal fire resource decisions for dispatch, response, and readiness based on the operating plan.</p>
            <img src="/images/nfdrs-flowchart.png" width="760" height="540"/>
    </main>
    );
}