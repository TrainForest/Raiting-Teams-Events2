import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserFunction } from '../users/entities/user_function.entity';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { UsersService } from 'src/users/users.service';
import { Requisitions } from './entities/requisition.entity';



@Injectable()
export class TeamsService {

  constructor(
    @InjectRepository(Team)  // user //,
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(User)  // user //,
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserFunction)
    private readonly userFunctionsRepository: Repository<UserFunction>,
    @InjectRepository(Function)
    private readonly functionsRepository: Repository<Function>,
    @InjectRepository(Requisitions)
    private readonly requisitionsRepository: Repository<Requisitions>,
    private readonly usersService: UsersService
  ) { }

  findOne(id: number) {
    return this.teamsRepository.findOneBy({ id: id });
  }

  update(id: number, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }

    // get all teams with leadeaders
    async findAll(): Promise<Team[]> {
      const head = "Руководитель"
  
      return this.teamsRepository
        .createQueryBuilder("teams")
  
        .select(["teams.id", "teams.title","teams.tags", "teams.image", "teams.description","teams.short_description", "teams.type_team"])
        .where("teams.type_team = :type", { type: "teams" })
        .leftJoin("teams.functions", "functions")
        .addSelect("functions.title")
        .andWhere("functions.title = :head", { head: "Руководитель" })
  
        .leftJoin("functions.userFunctions", "user_functions")
        .addSelect("user_functions.id")
        .leftJoinAndSelect("user_functions.user", "user")
        .addSelect("user.title_role")
        .orderBy("teams.id","DESC")
        .getMany()
    }

    
  // get all teams of specific direction for statistic
  async findAllTeamsOfDirection(type_team = "teams", id_parent=-1): Promise<[Team[], number]> {


    let teams = this.teamsRepository
      .createQueryBuilder("teams")

      .select(["teams.id", "teams.title", "teams.image", "teams.description", "teams.type_team",
      "teams.shortname"])
      .where("teams.type_team = :type", { type: type_team })

      // с учетом направления
      if(id_parent > 0){
        teams.andWhere("teams.id_parent = :id_parent ",{ id_parent: id_parent } )
        .leftJoin("teams.id_parent", "id_parent")
        .addSelect(["id_parent.id", "id_parent.shortname"])
      }
      
    return teams.getManyAndCount()
  }

  //вывести команду
  async teamWithUsers(id: number): Promise<UserFunction[]> {

    const users = await this.userFunctionsRepository

      .createQueryBuilder("user_functions")
      .select(["user_functions.dateStart", "user_functions.dateEnd"])
      .leftJoinAndSelect("user_functions.user", "user")
      .innerJoin("user_functions.function", "function")
      .addSelect('function.title')
      .innerJoin("function.team", "team")
      .where("team.id = :id", { id })
      .getMany()
    return users;
  }

  async userRequisition(user_id: number): Promise<Requisitions[]> {
    const users = await this.requisitionsRepository
    .createQueryBuilder("requisition")
    .select(["requisition.fullname","requisition.date_create", "requisition.date_update","requisition.status"])
    .where("requisition.user_id = :user_id", { user_id })
    .getMany()

    return users;
  }
  // async  directionsAndUsers() {

  //   const directionsUsers = await this.teamsRepository
  //   .createQueryBuilder("teams")
  //   .select("teams.direction")
  //   .getMany()
  //   return directionsUsers
  // }

  async teamsFunctions(id: number) {
    //начинаем с функций пользователя
    const teamsFunctions = await this.functionsRepository
      .createQueryBuilder("functions")
      .innerJoin("functions.team", "team")
      .addSelect("team.title")
      .where("functions.team_id = :id", { id: id })
      .getMany()

    return teamsFunctions
  }


  //создать команду, с учетом, что есь минимум 1 лидер
  async create(createTeamDto: CreateTeamDto): Promise<Team> {

    let team = await this.teamsRepository.save({
      ...createTeamDto,
      image: [],
      tags: [],
      type_team: "teams",
      creation_date: new Date()
    })

    await this.assignLeader(team, createTeamDto.userID)

    return team;
  }


  //назначить руководителя
  async assignLeader(team: Team, leaderid: number) {

    //создать руководителя
    let newFunction = await this.usersService.createFunction({
      title: 'Руководитель',
      team: team
    })

    let newUserFunction = await this.usersService.createUserFunction({
      function: newFunction.id,
      user: leaderid
    })


    return newUserFunction
  }

}



