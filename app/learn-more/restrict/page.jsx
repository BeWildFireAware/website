export default function restrictPage() {
    return(
    <main className="learn-more-file">
    <h2>Terminology &amp; Restrictions</h2>

            <h3>Federal Dispatch Areas</h3>
            <p>At present, the wildfire awareness system relies on federal dispatch boundary areas as the primary polygons for determining fire danger levels. The federal dispatch system consists of about 92 dispatch areas that assign federal resources to wildland fires. These centers collaborate closely with city and county agencies when fires grow larger or approach the wildland-urban interface. One reason for using dispatch center polygons is that each center has a fire danger operating plan, which outlines specific actions for federal firefighters based on daily and seven-day fire danger indices and forecasts.</p>

            <p>In addition to fire danger levels, dispatch centers use preparedness, staffing, response, and sometimes dispatch levels. These levels help managers and chiefs decide what resources to keep available, what to send to smoke reports, and what to deploy to active fires. Preparedness also allows them to bring in specialists, such as GIS personnel, public affairs staff, logistics coordinators, and others to support firefighting operations.</p>

            <p>Within each dispatch area, topographical features are divided into Fire Danger Rating Areas (FDRAs), based mostly on fuel types, but sometimes on elevation and similar weather patterns. Each dispatch area can have anywhere from one to ten FDRAs, depending on vegetation diversity, elevation, and other factors. FDRAs require at least one RAWS station—preferably two—to accurately track local weather conditions.</p>

            <h3>Fire Danger Rating Areas (FDRAs)</h3>
            <p>Fire Danger Rating Areas (FDRAs) are delineated within dispatch unit boundaries and are typically structured around fuel types and topographical features. Each FDRA is required to include at least one Remote Automated Weather Station (RAWS), preferably two or more, and should possess some degree of fire history to enhance the accuracy of fire danger prediction breakpoints. The predictive reliability increases with greater historical fire data present within the FDRA.</p>

            <p>FDRAs must be classified by the appropriate fuel model category for computational purposes, such as Z for slash, Y for timber, X for brush, W for grass and brush, and V for pure grass. After selecting the relevant fuel model, RAWS will calculate indices including ERC, BI, SC, KBDI, and IC. It is important to note that each index yields distinct values depending on the fuel model used; for example, an ERC value calculated for fuel model Z will differ from that of fuel model X due to fuel-specific computation methods.</p>

            <p>Selecting the proper fuel model ensures alignment with the predominant fuels within the FDRA and reflects the expected behavior during wildfire events, whether ignition or large-scale burning. In regions with extensive polygons, particularly in western areas, multiple fuel types may exist; however, the dominant fuel type and fire history guide the optimal model selection.</p>

            <p>Once the fuel model is determined, weather data from 2004 onward, alongside fire weather and fire history information, are incorporated into Fire Family Plus software. A goodness-of-fit test helps identify which indices are most effective for determining fire danger ratings. Breakpoints are then established for predicting fire danger levels.</p>

            <p>Wildland fires are influenced by numerous factors affecting ignition, spread, and size. Therefore, beyond displaying ERC and BI indices, we also provide information on 1000-hour fuels, temperatures, humidity, and wind conditions. This multifaceted approach enables comprehensive assessment of fire danger ratings and offers high-alert notifications when conditions warrant elevated concern. These alerts, referred to as "watch outs," number seven in total, and if three or more thresholds are met, heightened vigilance is advised.</p>

            <h3>Fire Restrictions</h3>
            <p>Fire restrictions are enforced at federal, state, and local levels. Each land management agency is authorized to implement fire restrictions within its jurisdiction. For example, federal agencies include the US Forest Service, Bureau of Land Management, National Park Service, Fish and Wildlife Service, and Bureau of Indian Affairs. State agencies manage areas classified as state land under state jurisdiction, while local agencies encompass counties and cities that govern private property. Each agency establishes specific fire restriction parameters, which may become more stringent as fire danger increases.</p>

            <p>Federal agencies utilize factors such as fire danger levels, weather forecasts, fuel moisture sampling, active fires, and available resources to determine whether fire restrictions are necessary and to what degree. To obtain the most current information regarding fire restrictions, it is strongly recommended to contact the local Forest Service, Bureau of Land Management, National Park Service, county, or city offices prior to starting a campfire or burning wood on private property.</p>

            <p>For residents of Colorado's western slope, a dedicated website provides access to up-to-date data concerning fire restrictions: <a href="https://westslopefireinfo.com/about-west-slope-fire-info/" target="_blank">West Slope Fire Info</a>.</p>
    </main>
    );
}