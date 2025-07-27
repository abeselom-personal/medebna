// controllers/room/room.controller.js
import * as roomService from '../../services/room.service.js';
import { roomResponseDto, roomCreateDto, roomUpdateDto } from '../../dtos/room.dto.js'
import { getBlurhash } from '../../utils/blurHash.js'

export const createRoom = async (req, res, next) => {
    try {
        const data = roomCreateDto(req.body, req.user.id);
        let processed = [];
        if (req.files && req.files.length > 0) {
            processed = await Promise.all(
                req.files.map(async file => {
                    const hash = await getBlurhash(file.path);
                    return {
                        url: `${process.env.BASE_URL}/${file.path}`,
                        blurhash: hash
                    };
                })
            );
            data.images = processed
        }

        const room = await roomService.createRoom(data);
        res.status(200).json(roomResponseDto(room));
    } catch (err) {
        next(err);
    }
};

export const createMultipleRooms = async (req, res, next) => {
    try {
        const rooms = req.body.rooms;
        const result = await roomService.createMultipleRooms(rooms, req.user.id);
        res.status(200).json(result.map(roomResponseDto));
    } catch (err) {
        next(err);
    }
};

export const getRoom = async (req, res, next) => {
    try {
        const room = await roomService.getRoomById(req.params.id);
        console.log(room)
        res.json(roomResponseDto(room));
    } catch (err) {
        next(err);
    }
};

export const listRooms = async (req, res, next) => {
    try {
        const rooms = await roomService.getRoomsByUser(req.user.id);
        res.json(rooms.map(roomResponseDto));
    } catch (err) {
        next(err);
    }
};

export const updateRoom = async (req, res, next) => {
    try {
        const data = roomUpdateDto(req.body);
        console.log(data)
        const room = await roomService.updateRoom(req.params.id, data);
        res.json(roomResponseDto(room));
    } catch (err) {
        next(err);
    }
};

export const updateRoomAvailability = async (req, res, next) => {
    try {
        const { type } = req.query;
        const delta = type === 'decriment' ? -1 : 1;
        const room = await roomService.updateRoomAvailability(req.params.id, delta);
        res.json(roomResponseDto(room));
    } catch (err) {
        next(err);
    }
};

export const deleteRoom = async (req, res, next) => {
    try {
        await roomService.deleteRoom(req.params.id);
        res.json({ message: 'Room deleted' });
    } catch (err) {
        next(err);
    }
};
