
import {useLocalStorage} from "usehooks-ts";
import {api} from "@/trpc/react";
import { getQueryKey } from "@trpc/react-query";
import { useEffect } from "react";
const useThreads = ()=>{
    const {data : accounts } = api.mail.getAccounts.useQuery();
    const [accountId] = useLocalStorage("accountId" , "");
    const [tab] = useLocalStorage('normalhuman-tab', 'inbox')
    const [done] = useLocalStorage('normalhuman-done', false)

    const queryKey = getQueryKey(api.mail.getThreads , {accountId , tab , done} , "query")
    const {data : threads , isFetching , refetch} = api.mail.getThreads.useQuery({
        accountId,
        done,
        tab
    }, {enabled : !!accountId && !!tab , placeholderData : (e)=> e , refetchInterval : 1000 * 5})

    useEffect(() => {
        console.log("newhkdfsk" , threads);
        console.log("accss" , accountId);
        console.log("taks" , tab);
        console.log("kshs", done);
    }, [])
    

    return {
        threads,
        isFetching,
        account : accounts?.find((account)=> account.id === accountId),
        refetch,
        accounts,
        queryKey,
        accountId
    }

}

export default useThreads;