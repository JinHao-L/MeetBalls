import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Suggestion } from 'src/suggestions/suggestion.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { AgendaItem } from './agenda-item.entity';
import { CreateAgendaItemDto } from './dto/create-agenda-item.dto';
import { UpdateAgendaItemDto } from './dto/update-agenda-item.dto';
import { UpdateAgendaItemsPositionDto } from './dto/update-agenda-items-position.dto';

@Injectable()
export class AgendaItemsService {
  constructor(
    @InjectRepository(AgendaItem)
    private agendaItemRepository: Repository<AgendaItem>,
  ) {}

  public async createOneAgendaItem(
    createAgendaItemDto: CreateAgendaItemDto,
  ): Promise<AgendaItem> {
    const { meetingId, position } = createAgendaItemDto;
    const agendaItem = await this.agendaItemRepository.findOne({
      meetingId,
      position,
    });
    if (agendaItem) {
      throw new BadRequestException(
        `Agenda item with position ${position} already exists`,
      );
    }
    const agendaItemToBeCreated = this.agendaItemRepository.create({
      ...createAgendaItemDto,
      ...(createAgendaItemDto.speakerId && {
        speaker: { id: createAgendaItemDto.speakerId },
      }),
    });
    await this.agendaItemRepository.save(agendaItemToBeCreated);

    // await this.updateAgendaItemsPositionOld(meetingId, position);
    return this.agendaItemRepository.findOne({ meetingId, position });
  }

  public async getAgendaItemsByMeetingId(
    meetingId: string,
  ): Promise<AgendaItem[]> {
    return this.agendaItemRepository.find({
      where: [{ meetingId }],
      order: {
        position: 'ASC',
      },
    });
  }

  public async deleteAgendaItemByMeetingIdAndPosition(
    meetingId: string,
    position: number,
  ) {
    const agendaItemToBeDeleted = await this.agendaItemRepository.findOne({
      meetingId,
      position,
    });
    if (!agendaItemToBeDeleted) {
      throw new NotFoundException(
        `Agenda Item with meetingId ${meetingId} and position ${position} not found`,
      );
    }
    try {
      const lastPosition =
        (await this.agendaItemRepository.count({ meetingId })) - 1;
      await this.agendaItemRepository.remove(agendaItemToBeDeleted);
      await this.updateAgendaItemsPosition(meetingId, position, lastPosition);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  // Decrement the positions of the agenda items with a greater position by 1 (Is this necessary?)
  // private async updateAgendaItemsPositionOld(
  //   meetingId: string,
  //   position: number,
  // ): Promise<void> {
  //   await this.agendaItemRepository
  //     .createQueryBuilder()
  //     .update(AgendaItem)
  //     .set({
  //       position: () => 'position - 1',
  //     })
  //     .where({ meetingId, position: MoreThan(position) })
  //     .execute();
  // }

  private async updateAgendaItemsPosition(
    meetingId: string,
    position: number,
    lastPosition: number,
  ): Promise<void> {
    let agendaItemsToBeUpdated = await this.agendaItemRepository.find({
      meetingId,
      position: MoreThan(position),
    });
    agendaItemsToBeUpdated = agendaItemsToBeUpdated.map((agendaItem) => {
      return {
        ...agendaItem,
        position: agendaItem.position - 1,
      };
    });
    await this.agendaItemRepository.save(agendaItemsToBeUpdated);
    await this.agendaItemRepository.delete({
      meetingId,
      position: lastPosition,
    });
  }

  public async getAgendaItemByMeetingIdAndPosition(
    meetingId: string,
    position: number,
  ): Promise<AgendaItem> {
    return this.agendaItemRepository.findOne(
      {
        meetingId,
        position,
      },
      { relations: ['meeting'] },
    );
  }
  public async updateAgendaItemByMeetingIdAndPosition(
    targetAgenda: AgendaItem,
    updateAgendaItemDto: UpdateAgendaItemDto,
  ): Promise<void> {
    try {
      const { speakerId, ...updateDetails } = updateAgendaItemDto;
      delete targetAgenda.meeting;
      const newAgenda = this.agendaItemRepository.create({
        ...targetAgenda,
        ...updateDetails,
        speaker: speakerId ? { id: speakerId } : null,
      });
      await this.agendaItemRepository.save(newAgenda);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  public async reorderAgendaItemsPosition(
    updateAgendaItemsPositionDto: UpdateAgendaItemsPositionDto,
  ): Promise<void> {
    const { meetingId, positions } = updateAgendaItemsPositionDto;
    const listOfOldPositions: number[] = [
      ...new Set(
        [...positions].map((position) => {
          return position.oldPosition;
        }),
      ),
    ];
    const listOfNewPositions: number[] = [
      ...new Set(
        [...positions].map((position) => {
          return position.newPosition;
        }),
      ),
    ];
    let agendaItemsToReorder = await this.agendaItemRepository.find({
      meetingId,
      position: In(listOfOldPositions),
    });
    if (
      agendaItemsToReorder.length !== positions.length ||
      listOfNewPositions.length !== positions.length
    ) {
      // Cause probably not user's fault but we forgot to consider some edge case.
      throw new InternalServerErrorException('Error in positions array');
    }
    agendaItemsToReorder = agendaItemsToReorder.map((agendaItem) => {
      const oldPosition = agendaItem.position;
      const newPosition = positions.find(
        (position) => position.oldPosition === oldPosition,
      ).newPosition;
      if (isNil(newPosition)) {
        throw new InternalServerErrorException();
      }
      return {
        ...agendaItem,
        position: newPosition,
      };
    });
    await this.agendaItemRepository.save(agendaItemsToReorder);
  }

  public async createOneAgendaItemFromSuggestion(
    suggestion: Suggestion,
  ): Promise<AgendaItem> {
    const { meetingId, name, description, expectedDuration, speaker } =
      suggestion;
    const totalAgendaItemsInMeeting = (
      await this.agendaItemRepository.find({
        meetingId,
      })
    ).length;
    const agendaItemToBeCreated = this.agendaItemRepository.create({
      meetingId,
      position: totalAgendaItemsInMeeting,
      name,
      description,
      expectedDuration,
      ...(speaker && {
        speaker: {
          id: speaker.id,
        },
      }),
    });
    const createdAgendaItem = await this.agendaItemRepository.save(
      agendaItemToBeCreated,
    );
    return this.agendaItemRepository.findOne({
      meetingId,
      position: createdAgendaItem.position,
    });
  }
}
