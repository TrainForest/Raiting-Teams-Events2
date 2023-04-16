import { defineStore } from "pinia";
import axios from "axios";
import { Direction, Level, Type } from "./enums/enum_event";

export const useEventStore = defineStore("events", () => {

  async function fetchEvents(): Promise<any> {
    const res = await axios.get('api/events/external')
    const data = res.data

    return data
  }

  async function fetchEventById(id: number): Promise<any> {
    const res = await axios.get('api/events/' + id)
    const data = res.data

    return data
  }

  // найти мероприятия по направлению
  async function getEventsByDirection(direction: Direction = Direction.ALL,
    dateStart:Date, dateEnd:Date, level: Level = Level.ALL, type: Type = Type.ALL
     ): Promise<any> {

    let res = null

    let lvl = level != Level.ALL ? level : null
    let tp = type != Type.ALL ? type : null
    let dr = direction != Direction.ALL ? direction : null

    //need get all directions
    res = await axios.get('api/events/', { params: { direction: dr, level: lvl, type: tp,
      dateStart:dateStart.toISOString(), dateEnd:dateEnd.toISOString()} })

    const data = res.data

    return data
  }


  const menu_items = [
    {
      id: 1, title: 'Формат проведения', menu_types: [
        { id: 1, title: 'Online' },
        { id: 2, title: 'Offline' },
      ]
    },
    {
      id: 2, title: 'Уровень', menu_types: [
        { id: 1, title: 'Внутривузовский' },
        { id: 2, title: 'Межвузовский' },
        { id: 3, title: 'Региональный' },
        { id: 4, title: 'Всероссийский' },
      ]
    },
    {
      id: 3, title: 'Институт', hidden: true, menu_types: [
        { id: 1, title: 'Авиамашиностроения и транспорта' },
        { id: 2, title: 'Архитектуры, строительства и дизайна' },
        { id: 3, title: 'Высоких технологий' },
        { id: 4, title: 'Информационных технологий и анализа даных' },
        { id: 5, title: 'Квантовой физики' },
        { id: 6, title: 'Лингвистики и межкультурной коммуникации' },
        { id: 7, title: 'Недропользования' },
        { id: 8, title: 'Экономики, управления и права' },
        { id: 9, title: 'Энергетики' },
        { id: 10, title: 'БРИКС' },
      ]
    },
    {
      id: 4, title: 'Курс', hidden: true, menu_types: [
        { id: 1, title: '1 курс' },
        { id: 2, title: '2 курс' },
        { id: 3, title: '3 курс' },
        { id: 4, title: '4 курс' },
        { id: 5, title: '5 курс' },
        { id: 6, title: 'Магистратура' },
      ]
    }
  ]

  return {
    menu_items,
    fetchEvents,
    fetchEventById,
    getEventsByDirection
  }
})