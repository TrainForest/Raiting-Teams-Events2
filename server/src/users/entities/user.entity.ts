import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, Column, Entity,JoinColumn,ManyToOne,OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserFunction } from "./user_function.entity";
import * as argon2 from 'argon2';
import { Requisitions } from "../../teams/entities/requisition.entity";

@Entity("users")
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty()
    @Column({ nullable: true ,default: "123"})
    username: string

    @ApiProperty()
    @Column({ type: "int" , nullable: true })
    studnumber: number

    @ApiProperty()
    @Column({ nullable: true })
    fullname: string

    @ApiProperty()
    @Column()
    email: string
    
    @ApiProperty() 
    @Column({ nullable: true })
    education_group: string

    @ApiProperty() 
    @Column({ nullable: true })
    institute: string

    @ApiProperty() 
    @Column({ nullable: true })
    gender: string

    @ApiProperty() 
    @Column({ nullable: true })
    phone: string

    @ApiProperty() 
    @Column({ nullable: true ,default: "123"})
    password: string

    @ApiProperty()
    @Column({ type: "date" , nullable: true })
    birthdate: string

    @ApiProperty() 
    @Column({ nullable: true })
    type_time_study: string

    @ApiProperty()
    @Column("simple-array",{ nullable: true })
    permissions: string[]

    @OneToMany((type)=>UserFunction, (user_func)=>user_func.user)
    user_function:UserFunction[]

    @BeforeInsert()
    async hashPassword() {
        this.password = await argon2.hash(this.password);
    }

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    course: number;

    @OneToMany((type) => Requisitions, (requisitions) => requisitions.id)
    requisitions: Requisitions[]


}
