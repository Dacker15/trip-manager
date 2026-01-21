import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { User as IUser } from '@common/interfaces/user.interface'

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true, name: 'user_name' })
  userName: string

  @Column()
  password: string

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}
