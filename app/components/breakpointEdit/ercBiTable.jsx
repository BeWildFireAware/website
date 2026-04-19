//for erc+bi fdras, sort by danger level for organization,
export default function ErcBiTable({breakpoints, dangerLevels, onChange}){
    // Sort breakpoints by Danger_Level (ascending)
    const sortedBreakpoints = [...breakpoints].sort((a, b) => a.Danger_Level - b.Danger_Level);
    
    return (
        <table className="erc-bi-table">
            <thead>
                <tr>
                    <th>ERC Breakpoint</th>
                    <th>BI Breakpoint</th>
                    <th>Danger Level</th>
                </tr>
            </thead>
            <tbody>
                {sortedBreakpoints.map((bp, index) => {
                    // Find the original index in the unsorted array for onChange
                    const originalIndex = breakpoints.findIndex(
                        b => b.ID === bp.ID || 
                        (b.Erc_Breakpoint === bp.Erc_Breakpoint && 
                         b.Bi_Breakpoint === bp.Bi_Breakpoint && 
                         b.Danger_Level === bp.Danger_Level)
                    );
                    
                    return (
                        <tr key={bp.ID || index}>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={bp.Erc_Breakpoint}
                                    onChange={(e) => onChange(originalIndex, 'Erc_Breakpoint', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={bp.Bi_Breakpoint}
                                    onChange={(e) => onChange(originalIndex, 'Bi_Breakpoint', e.target.value)}
                                />
                            </td>
                            <td>{dangerLevels[bp.Danger_Level-1]}</td>
                        </tr>
                    );
                })}
            </tbody>  
        </table>    
    );
}