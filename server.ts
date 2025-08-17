import fastify from 'fastify'
import crypto from 'node:crypto'

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
  name: string
}

let courses = [
  { id: '1', name: 'Curso de Node.js' },
  { id: '2', name: 'Curso de React' },
  { id: '3', name: 'Curso de React Native' },
]

server.get('/courses', (request, reply) => {
  return reply.status(200).send({ courses })
})

server.get('/courses/:id', (request, reply) => {
  const { id } = request.params as CoursesType
  const course = courses.find((course) => course.id === id)
  return reply.status(200).send({ course })
})

server.post('/courses', (request, reply) => {
  const courseId = crypto.randomUUID()
  const { name } = request.body as CoursesType

  courses.push({
    id: courseId,
    name: name,
  })

  return reply.status(201).send({ courseId })
})

server.put('/courses/:id', (request, reply) => {
  const { id } = request.params as CoursesType
  const data = request.body as CoursesType

  // Verifica se o curso existe
  const courseIndex = courses.findIndex((course) => course.id === id)

  if (courseIndex === -1) {
    return reply.status(404).send({ error: 'Curso não encontrado' })
  }

  // Atualiza os dados mantendo o mesmo ID
  courses[courseIndex] = { ...courses[courseIndex], ...data, id }

  return reply.status(200).send({
    message: 'Curso atualizado com sucesso!',
    course: courses[courseIndex],
  })
})

server.delete('/courses/:id', (request, reply) => {
  const { id } = request.params as CoursesType
  const delCourse = courses.find((course) => course.id === id)
  courses = courses.filter((del) => del !== delCourse)

  return reply.status(200).send({ delCourse })
})

server.listen({ port: 3333 }, () => {
  console.log('🔥 Server is running! ')
})
