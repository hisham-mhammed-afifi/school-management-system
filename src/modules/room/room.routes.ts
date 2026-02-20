import { Router } from 'express';
import type { RoomController } from './room.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createRoomRoutes(controller: RoomController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /rooms:
   *   get:
   *     tags: [Rooms]
   *     summary: List rooms
   *     description: Get a paginated list of rooms for the current school.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: roomType
   *         schema:
   *           type: string
   *           enum: [classroom, laboratory, library, auditorium, gym, other]
   *         description: Filter by room type
   *       - in: query
   *         name: building
   *         schema:
   *           type: string
   *         description: Filter by building name
   *     responses:
   *       200:
   *         description: Rooms retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Room'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('rooms.list'), controller.list);

  /**
   * @openapi
   * /rooms/{id}:
   *   get:
   *     tags: [Rooms]
   *     summary: Get a room by ID
   *     description: Retrieve detailed information about a specific room.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Room ID
   *     responses:
   *       200:
   *         description: Room retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('rooms.read'), controller.getById);

  /**
   * @openapi
   * /rooms:
   *   post:
   *     tags: [Rooms]
   *     summary: Create a new room
   *     description: Create a new room for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [roomNumber, capacity, roomType]
   *             properties:
   *               roomNumber:
   *                 type: string
   *                 example: 'A101'
   *               building:
   *                 type: string
   *                 example: 'Main Building'
   *               floor:
   *                 type: integer
   *                 example: 1
   *               capacity:
   *                 type: integer
   *                 example: 40
   *               roomType:
   *                 type: string
   *                 enum: [classroom, laboratory, library, auditorium, gym, other]
   *                 example: 'classroom'
   *               facilities:
   *                 type: string
   *                 example: 'Projector, Whiteboard, Air Conditioning'
   *     responses:
   *       201:
   *         description: Room created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Room number already exists in this building
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('rooms.create'), controller.create);

  /**
   * @openapi
   * /rooms/{id}:
   *   patch:
   *     tags: [Rooms]
   *     summary: Update a room
   *     description: Update room details such as capacity, facilities, or room type.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               roomNumber: { type: string }
   *               building: { type: string }
   *               floor: { type: integer }
   *               capacity: { type: integer }
   *               roomType: { type: string, enum: [classroom, laboratory, library, auditorium, gym, other] }
   *               facilities: { type: string }
   *     responses:
   *       200:
   *         description: Room updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Room'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('rooms.update'), controller.update);

  /**
   * @openapi
   * /rooms/{id}:
   *   delete:
   *     tags: [Rooms]
   *     summary: Delete a room
   *     description: Delete a room. Cannot delete rooms assigned to class sections or lessons.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Room ID
   *     responses:
   *       204:
   *         description: Room deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete room with associated data
   */
  router.delete('/:id', requirePermission('rooms.delete'), controller.remove);

  /**
   * @openapi
   * /rooms/{roomId}/subjects:
   *   get:
   *     tags: [Rooms]
   *     summary: Get suitable subjects for a room
   *     description: |
   *       Retrieve all subjects that are marked as suitable for this room,
   *       including suitability scores.
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Room ID
   *     responses:
   *       200:
   *         description: Suitable subjects retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/RoomSubject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Room not found
   */
  router.get('/:roomId/subjects', requirePermission('rooms.read'), controller.getSubjects);

  /**
   * @openapi
   * /rooms/{roomId}/subjects:
   *   put:
   *     tags: [Rooms]
   *     summary: Assign suitable subjects to a room
   *     description: |
   *       Replace all subject suitability assignments for a room.
   *       Used for scheduling optimization (e.g., science labs are suitable for science subjects).
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Room ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [subjects]
   *             properties:
   *               subjects:
   *                 type: array
   *                 description: Array of subject assignments with suitability scores
   *                 items:
   *                   type: object
   *                   required: [subjectId, suitabilityScore]
   *                   properties:
   *                     subjectId:
   *                       type: string
   *                       format: uuid
   *                     suitabilityScore:
   *                       type: integer
   *                       minimum: 1
   *                       maximum: 10
   *                       description: Higher score means more suitable (1-10)
   *     responses:
   *       200:
   *         description: Subject suitability updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/RoomSubject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Room or subject not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/:roomId/subjects', requirePermission('rooms.update'), controller.assignSubjects);

  return router;
}
