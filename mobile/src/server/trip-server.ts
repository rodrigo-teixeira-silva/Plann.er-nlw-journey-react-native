import { api } from "./api"

export type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean
}

type TripCreate = Omit<TripDetails, "id" | "is_confirmed"> & {

  emails_to_invite: String[]

}

async function getById(id: String) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`)
    return data.trip
  } catch {
    throw new MediaError;

  }
}

async function create({
  destination,
  starts_at,
  ends_at,
  emails_to_invite,
 
}: TripCreate) {
  try {
    const { data } = await api.post< {tripId: string}>("/trips", {
      destination,
      starts_at,
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

