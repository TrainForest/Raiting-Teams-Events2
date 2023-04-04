import { defineStore } from "pinia";
import { computed, ref } from "vue";
// import type { Permission } from "@/types";
import axios from "axios";

export const useTeamStore = defineStore("teams", () => {
    const layout = ref(true)

    function CreateTeamsTest() {
        console.log('Это сработало!');
    }

    // Вывести все коллективвы с руководителсями
    async function fetchTeams(): Promise<any> {
        const res = await axios.get('/api/teams')
        const data = res.data

        return data
    }

    async function fetchTeamsOfDirection(direction: number = -1, type_team = "teams"): Promise<any> {
        const res = await axios.get('/api/teams/direction', { params: { id_parent: direction,  type_team: type_team } })
        const data = res.data

        return data
    }


    async function fetchCreateTeams() {
        await axios.get('/api')
            .then((respose: any) => {
                // Умные действия
            })
    }

    async function createTeam(title: String, description: String,
        shortname: String, userId: Number) {

        let responseMsg = "сохранено"

        //create team
        await axios.post("api/teams", {
            title: title,
            description: description,
            shortname: shortname,
            userID: userId
        })
            .catch((err) => {
                if (err.response) {
                    responseMsg = err.response.data.message[0]
                }
            })

        return responseMsg
    }

    // Переключение Switch_toggle в стр. Коллективы и Мероприятия
    function setLayout(res: any) {
        this.layout = res;
    }

    return {
        CreateTeamsTest,
        fetchCreateTeams,
        fetchTeams,
        createTeam,
        setLayout,
        fetchTeamsOfDirection,

        layout,
    }
});
