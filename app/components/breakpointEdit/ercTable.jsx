//erc only table
export default function ErcTable({breakpoints, dangerLevels, onChange}){
    return (
        <table className="erc-table">
            <thead>
                <tr>
                    <th>Erc Breakpoint</th>
                    <th>Danger Level</th>
                </tr>
            </thead>
            <tbody>
                {breakpoints.map((bp, index) => (
                    <tr key={index}>
                        <td>{dangerLevels[bp.Danger_Level-1]}</td>
                        <td>
                            <input
                                type="number"
                                value={bp.Erc_Breakpoint}
                                onChange={(e) => onChange(index, 'Erc_Breakpoint', e.target.value)}
                            ></input>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

}