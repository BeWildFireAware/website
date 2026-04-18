export default function ErcBiTable({breakpoints, dangerLevels, onChange}){
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
                {breakpoints.map((bp, index) => (
                    <tr key={index}>
                        <td>
                            <input
                                type="number"
                                value={bp.Erc_Breakpoint}
                                onChange={(e) => onChange(index, 'Erc_Breakpoint', e.target.value)}
                            >
                            </input>
                        </td>
                        <td>
                            <input
                                type="number"
                                value={bp.Bi_Breakpoint}
                                onChange={(e) => onChange(index, 'Bi_Breakpoint', e.target.value)}
                            >
                            </input>
                        </td>
                        <td>{dangerLevels[bp.Danger_Level-1]}</td>
                    </tr>       
                ))}
            </tbody>  
        </table>    
    );
}