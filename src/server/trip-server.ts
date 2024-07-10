import { Type } from "lucide-react-native"
import { api } from "./api"

export type TripeDetails = {
  id: String
  destination: String
  start_at: String
  ends_at: String
  is_confirmed: boolean

}

type TripCreate = Omit<TripeDetails, "id" | "is_confirmed"> & {

  emails_to_invite: String[]

}

async function getById(id: String) {
  try {
    const { data } = await api.get<{ trip: TripeDetails }>(`/trips/${id}`)
    return data.trip
  } catch {
    throw new MediaError;

  }
}

async function create({
  destination,
  start_at,
  ends_at,
  emails_to_invite,
 
}: TripCreate) {
  try {
    const { data } = await api.post< {tripId: String}>("/trips", {
      destination,
      start_at,
      ends_at,
      emails_to_invite,
      owner_name: "Rodrigo Teixeira",
      owner_email: "linkdri@gmail.com"
    })
    return data
  } catch (error) {
    throw error
  }
}

export const tripServer = { getById, create }

