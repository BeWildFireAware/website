export default function modelsPage() {
    return(
    <main className="learn-more-file">
    <h2>Fuel Models</h2>

            <h3>Overview</h3>
            <p>In wildland fire management, fuels—materials that combust during a wildfire—are classified into five distinct categories. Fuel Model V primarily refers to grass sub-models, focusing on fields dominated by grass. Fuel Model W includes areas where grass is present alongside a minor brush component. Fuel Model X represents environments characterized largely by brush. Fuel Model Y pertains to timber field types, while Fuel Model Z describes slash, commonly found in logging areas.</p>

            <p>When selecting the appropriate fuel model for calculations, it is essential to determine the predominant material most likely to ignite and carry the fire. For example, in a pure grass field, only grass will burn, warranting the use of Fuel Model V. If the area contains both grass and ponderosa pine, with grass as the primary fire carrier, Fuel Model W would be suitable. In timber-dominated forests, such as mixed conifer stands with spruce, pine, Douglas fir, and dead or downed trees, Fuel Model Y is most appropriate. Fuel Model Z applies mostly to regions with significant logging slash. Fuel Model X encompasses brush-type environments, which can display highly variable fire behavior depending on the type of brush.</p>

            <p>Previously, fuels were categorized using 40 different models providing granular detail for site-specific fire prediction. However, advancements in fire danger mapping led the National Fire Danger Rating System (NFDRS) to consolidate these into five models, streamlining predictions without sacrificing accuracy. For prescribed burning or specific fire events, practitioners may utilize satellite mapping to reference the 40 fuel models for targeted fire behavior assessment. Nonetheless, for broad-scale wildfire prediction and federal resource allocation, the five fuel models provide an effective and efficient classification system.</p>
            <section className="doc-section">
                <h3>Fuel Model V — Grass</h3>
                <h4>Fuel Model A</h4>
                <p>This model portrays western grasslands dominated by annual grasses and forbs. While sparse brush or tree coverage may exist—occupying less than one-third of the area—the primary examples are cheatgrass and medusa head. Open pinyon-juniper, sagebrush-grass, and desert shrub types may also be assigned this model if woody plants meet density requirements. Ground fuel quantity and continuity fluctuate significantly with annual rainfall.</p>
                
                <h4>Fuel Model L</h4>
                <p>Designed for western grasslands with perennial grasses, this model features coarser principal species and heavier loadings compared to Model A. Shrubs and trees are similarly sparse, occupying less than one-third of the area. Fuel quantities tend to remain stable year-to-year. In sagebrush regions, Fuel Model T may offer greater applicability.</p>
            </section>

            <section className="doc-section">
                <h3>Fuel Model W — Grass/Shrub</h3>
                <h4>Fuel Model C</h4>
                <p>Characterized by open pine stands with perennial grasses and forbs as predominant ground fuels, supplemented by needle litter and branch-wood contributing to overall fuel loading. While some brushes and shrubs may be present, their impact is minimal. Typical areas include open, longleaf, slash, ponderosa, Jeffrey, and sugar pine stands, and select pinyon-juniper stands.</p>

                <h4>Fuel Model D</h4>
                <p>Specifically developed for the palmetto-gallberry understory-pine associations of southeastern coastal plains, and applicable to Low Pocosins where Fuel Model O may be overly severe. Utilization should be restricted to the Southeast due to associated high moisture of extinction.</p>

                <h4>Fuel Model N</h4>
                <p>Tailored for the sawgrass prairies of southern Florida, this model may also be relevant for other marsh environments containing coarse, reed-like fuels. It assumes that one-third of the aerial plant component is dead, presenting potential for rapid, intense fires even above standing water.</p>

                <h4>Fuel Model S</h4>
                <p>Alaskan and alpine tundra on well-drained sites correspond to this model, typically comprising grass, low shrubs, and a pronounced layer of lichens and moss. Fires in these conditions are slow and of low intensity but pose challenges for suppression.</p>

                <h4>Fuel Model T</h4>
                <p>Sagebrush-grass types across the Great Basin and Intermountain West are emblematic of this model. Shrubs must occupy at least one-third of the site; otherwise, Fuel Models A or L are more appropriate. This model can extend to immature scrub oak and desert shrub communities in the West or scrub oak-wire grass types in the Southeast.</p>
            </section>

            <section className="doc-section">
                <h3>Fuel Model Y — Timber Understory and Timber Litter</h3>
                <h4>Fuel Model H</h4>
                <p>Applied to short-needled conifer stands such as white pines, spruces, larches, and firs. The stand is generally healthy, with minimal undergrowth and a thin ground fuel layer. Fires are typically slow-moving and only hazardous in concentrated downed woody material areas.</p>

                <h4>Fuel Model G</h4>
                <p>Suited for dense conifer stands exhibiting significant litter and downed woody debris accumulations, often over-mature and experiencing insect, disease, or weather-related damage. The forest floor contains deep duff and substantial woody material, largely exceeding three inches in diameter. Typical stands include hemlock-Sitka spruce, coastal Douglas-fir, and damaged lodgepole pine and spruce.</p>

                <h4>Fuel Model E</h4>
                <p>Used post-leaf fall for hardwood and mixed hardwood-conifer stands dominated by hardwoods. The primary fuel consists of hardwood leaf litter, making it ideal for oak-hickory types and northern hardwoods or mixed forests in the Southeast.</p>

                <h4>Fuel Model R</h4>
                <p>Represents hardwood areas following spring canopy development, serving as the growing season equivalent to Fuel Model E. It is appropriate in summer months for hardwood and mixed conifer-hardwood stands with predominantly deciduous overstory.</p>

                <h4>Fuel Model U</h4>
                <p>Pertains to closed stands of western long-needled pines, where ground fuel is mainly comprised of litter and small branch-wood. Dense canopies exclude grass and shrub presence except in occasional natural openings. Applicable to ponderosa, Jeffrey, and sugar pine stands of the West, and red pine stands of the Lake States.</p>

                <h4>Fuel Model P</h4>
                <p>Characterizes closed, healthy stands of long-needled southern pines. Primary fuels include a 2–4-inch layer of lightly compacted needle litter and scattered small branch-wood. The canopy density limits shrub and grass growth.</p>
            </section>

            <section className="doc-section">
                <h3>Fuel Model X — Brush/Shrub</h3>
                <h4>Fuel Model B</h4>
                <p>Covers mature, dense brush fields exceeding six feet in height, where at least one-fourth of aerial fuels are dead. These fuels burn readily and promote intense, fast-spreading fires. Suitable for California mixed chaparral (typically 30 years or older), with Fuel Model F preferred for pure chamise stands.</p>

                <h4>Fuel Model O</h4>
                <p>Applies to dense, brush-like fuels in the Southeast. Unlike Model B, O fuels are nearly entirely living aside from a substantial litter layer. Foliage combusts easily except during active growth periods. Plants are usually taller than six feet and commonly situated beneath open pine stands.</p>

                <h4>Fuel Model F</h4>
                <p>Represents mature closed chamise stands and oak brush fields in Arizona, Utah, and Colorado, as well as young closed and mature open California chaparral. Open pinyon-juniper stands are included.</p>

                <h4>Fuel Model Q</h4>
                <p>Reflects upland Alaska black spruce with dense stands interrupted by flammable shrub-filled openings. Forest floors are thick with moss and lichens, complemented by some needle litter and fine branch-wood. Persistent branches facilitate ground fires reaching crowns, creating dangerous crowning potential.</p>
            </section>

            <section className="doc-section">
                <h3>Fuel Model Z — Slash and Blowdown</h3>
                <h4>Fuel Model I</h4>
                <p>Intended for clear-cut conifer slash scenarios where materials less than six inches in diameter surpass 25 tons per acre. As slash settles and fines drop, fire potential may be overestimated. For lighter slash loads, Fuel Models J or K are recommended.</p>

                <h4>Fuel Model J</h4>
                <p>Serves as a counterpart to Fuel Model I, representing clear-cuts and heavily thinned conifer stands with less than 25 tons per acre of material under six inches in diameter. Similar to Model I, aging slash can result in overrated fire hazard assessments.</p>

                <h4>Fuel Model K</h4>
                <p>Identifies slash fuels from light thinning and partial cuts in conifer stands, typically scattered beneath an open canopy. This model is applicable to hardwood slash and southern pine clear-cuts with total fuel loading below 15 tons per acre.</p>
            </section>
    </main>
    );
}