'use server'//
import { supabase } from '@/lib/supabase'


export async function GetDropdownData() {
    try {
        const { data, error} = await supabase
            .from('DispatchArea')
            .select('Dispatch_ID, DispatchName, FDRA (FDRA_ID, FDRAname)') //left join FDRA on FDRA ID
            .order('DispatchName');
        if (error) {
            throw error;
        }

        const formattedData = data.map(dispatch => ({
            id: dispatch.Dispatch_ID,
            name: dispatch.DispatchName,
            fdrAs: dispatch.FDRA.map(fdra => ({
                id: fdra.FDRA_ID,
                name: fdra.FDRAname
            }))
        }));
        return { data: formattedData, error: null };

        


    } catch (error) {
        return { data: [], error: error.message };
    }

}