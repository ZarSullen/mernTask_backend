import { nanoid } from 'nanoid/non-secure'

const generarId = () => {
    const random = nanoid()
    return random
}

export default generarId