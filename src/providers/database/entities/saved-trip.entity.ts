import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '@providers/database/entities/user.entity'

@Entity('saved_trips')
@Index(['tripId', 'userId'], { unique: true })
export class SavedTrip {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'uuid', name: 'trip_id' })
  tripId: string

  @Column({ type: 'int', name: 'user_id' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

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
