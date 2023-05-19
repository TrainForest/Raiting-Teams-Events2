import { defineStore } from "pinia";
import { computed, ref } from "vue";
// import type { Permission } from "@/types";
import axios from "axios";
import type UpdateTeam from "@/views/Modals/UpdateTeam";

export const useTeamStore = defineStore("teams", () => {
    const layout = ref(true)

    function CreateTeamsTest() {
        console.log('Это сработало!');
    }

    // Вывести все коллективвы с руководителсями
    async function fetchTeams(): Promise<any> {
        const res = await axios.get('/api/teams')

        // const res2 = await axios.get('/api/uploads/',{params:{path:"/public/media/87a39a3586e19c22106a10ad53d0434b101.pdf"}} )
        // console.log(res2)
        const data = res.data

        return data
    }

    // data will be returned as index 0 - is data, index 1 is count
    async function fetchTeamsOfDirection(direction: number = -1, type_team = "teams"): Promise<any> {
        const res = await axios.get('/api/teams/direction', { params: { id_parent: direction, type_team: type_team } })
        const data = res.data

        return data
    }


    async function fetchCreateTeams() {
        await axios.get('/api')
            .then((respose: any) => {
                // Умные действия
            })
    }
    async function fetchTeam(id: number): Promise<any> {
        const res = await axios.get('/api/teams/' + id + '/users')
        const data = res.data
        console.log(data)
        return data
    }
    async function fetchRequisition(user_id: number): Promise<any> {
        const res = await axios.get('/api/teams/' + user_id + '/requisition')
        const data = res.data
    
        return data
        
    }

    async function createTeam(title: string, description: string,
        shortname: string, userId: number, cabinet: string, fileUstav: any, fileDocument: any,) {

        let responseMsg = "сохранено"



        // const data = {

        //     title: title,
        //     description: description,
        //     shortname: shortname,
        //     userID: userId,
        //     fileUstav: fileUstav
        // }

        // alert( fileUstav.name.split(".").shift())

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('shortname', shortname);
        formData.append('userID', userId.toString());
        formData.append('cabinet', cabinet);
        formData.append('file', fileUstav);
        // formData.append('document', fileDocument);





        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }

        // const res = await axios.post('api/uploads', formData, config);

        // alert("res " + res.data)

        //create team
        await axios.post("api/teams", formData, config)
            .catch((err) => {
                if (err.response) {
                    responseMsg = err.response.data.message[0]
                }
            })

        return responseMsg
    }


    // обновить коллектив
    async function updateTeam(uT: UpdateTeam) {

        let responseMsg = "сохранено"

        await axios.put("api/teams/" + uT.id, {
            title: uT.title,
            description: uT.description,
            shortname: uT.shortname,
            cabinet: uT.cabinet,
            oldLeaderId: uT.oldUserId,
            newLeaderId: uT.newUserId,
            document: "dcf",
            charterTeam: "заглушка",
        })
            .catch((err) => {
                if (err.response) {
                    responseMsg = err.response.data.message[0]
                }
            })

        return responseMsg


    }

    //архивировать или нет колелктив
    async function archiveTeam(id: number, isArchive: boolean) {
        let responseMsg = isArchive ? "архивировано" : "разархивировано"
        let isOK = true

        await axios.put(`api/teams/${id}/archive`, {
            isArchive: isArchive
        })
            .catch((err) => {
                if (err.response) {
                    responseMsg = err.response.data.message[0]
                    isOK = false
                }
            })

        return { responseMsg, isOK }
    }

    // Переключение Switch_toggle в стр. Коллективы и Мероприятия
    function setLayout(res: any) {
        this.layout = res;
    }

    const menu_items = [
        {
            id: 1, title: 'Набор', hidden: true, menu_types: [
                { id: 1, title: 'Набор открыт' },
                { id: 2, title: 'Набор закрыт' },
            ]
        },
        {
            id: 2, title: 'Вид деятельности', hidden: true, menu_types: [
                { id: 1, title: 'Научная деятельность' },
                { id: 2, title: 'Учебная деятельность' },
                { id: 3, title: 'Научная деятельность' },
                { id: 4, title: 'Спортивная деятельность' },
                { id: 5, title: 'Культурно-творческая деятельность' },
            ]
        },
    ]

    return {
        CreateTeamsTest,
        fetchCreateTeams,
        fetchTeams,
        createTeam,
        setLayout,
        fetchTeamsOfDirection,
        fetchTeam,
        updateTeam,
        archiveTeam,
        fetchRequisition,

        layout,
        menu_items
    }
});
