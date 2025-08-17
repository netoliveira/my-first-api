import fastify from 'fastify'
import { db } from './src/database/client.ts'
import { courses } from './src/database/schema.ts'
import { eq } from 'drizzle-orm'

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

type CoursesType = {
  id: string
  title: string
  description: string
}

server.get('/courses', async (request, reply) => {
  const result = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
    })
    .from(courses)
  return reply.status(200).send({ result })
})

server.get('/courses/:id', async (request, reply) => {
  const { id } = request.params as CoursesType
  const result = await db.select().from(courses).where(eq(courses.id, id))
  if (result.length > 0) {
    return reply.status(200).send({ course: result[0] })
  }
  return reply.status(404).send()
})

server.post('/courses', async (request, reply) => {
  const { title, description } = request.body as CoursesType

  if (!title) {
    return reply.status(400).send({ message: 'Título é obrigatório' })
  }

  const result = await db
    .insert(courses)
    .values({
      title: title,
      description: description,
    })
    .returning()

  return reply.status(201).send({ courseID: result[0].id })
})

server.put('/courses/:id', async (request, reply) => {
  const { id } = request.params as CoursesType
  const data = request.body as CoursesType

  // Verifica se o curso existe
  const courseIndex = await db.select().from(courses).where(eq(courses.id, id))

  if (!courseIndex) {
    return reply.status(404).send({ error: 'Curso não encontrado' })
  }

  // Atualiza os dados mantendo o mesmo ID
  const result = await db
    .update(courses)
    .set({
      title: data.title,
      description: data.description,
    })
    .where(eq(courses.id, id))
    .returning({
      id: courses.id,
      title: courses.title,
      description: courses.description,
    })

  return reply.status(200).send({
    message: 'Curso atualizado com sucesso!',
    course: result,
  })
})

server.delete('/courses/:id', async (request, reply) => {
  const { id } = request.params as CoursesType
  const result = await db.delete(courses).where(eq(courses.id, id)).returning({
    id: courses.id,
    title: courses.title,
    description: courses.description,
  })

  return reply.status(200).send({
    message: 'Curso deletado com sucesso!',
    course: result,
  })
})

server.listen({ port: 3333 }, () => {
  console.log('🔥 Server is running! ')
})
