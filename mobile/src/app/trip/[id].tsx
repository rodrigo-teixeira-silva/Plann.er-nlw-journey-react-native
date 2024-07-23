import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { DateData } from "react-native-calendars";

import { TripDetails, tripServer } from "@/server/trip-server";
import { Loading } from "@/components/loading";
import { Input } from "@/components/input";
import { colors } from "@/styles/colors";
import {
  CalendarRange,
  Info,
  MapPin,
  Settings2,
  Calendar as IconCalendar,
} from "lucide-react-native";
import dayjs from "dayjs";
import { Button } from "@/components/button";
import { Activities } from "./activities";
import { Details } from "./details";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DatesSelected, calendarUtils } from "@/utils/calendarUtils";

type TripData = TripDetails & { when: string };

export default function Trip() {
  enum MODAL {
    NOME = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
  }

  //LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  //MODAL
  const [showModal, setShowModal] = useState(MODAL.NOME);
  //DATA
  const [tripDetails, setTripDetails] = useState({} as TripData);
  const [options, setOptions] = useState<"activity" | "details">("activity");
  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  const tripId = useLocalSearchParams<{ id: string }>().id;

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  }

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);

      if (!tripId) {
        return router.back();
      }

      const trip = await tripServer.getById(tripId);

      const maxLeightDestination = 14;
      const destination =
        trip.destination.length > maxLeightDestination
          ? trip.destination.slice(0, maxLeightDestination) + "..."
          : trip.destination;

      const starts_at = dayjs(trip.starts_at).format("DD");
      const ends_at = dayjs(trip.ends_at).format("DD");
      const month = dayjs(trip.starts_at).format("MMM");

      setDestination(trip.destination);

      setTripDetails({
        ...trip,
        when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    <Loading />;
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input Variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails.when} readOnly />

        <TouchableOpacity
          activeOpacity={0.6}
          className="w-9 h-9 bg-zinc-800
          items-center justify-center rounded"
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {options === "activity" ? (
        <Activities tripDetails={tripDetails} />
      ) : (
        <Details tripId={tripDetails.id} />
      )}

      <View
        className="w-full absolute -bottom-1 self-center justify-end pb-5
      z-10 bg-zinc-950"
      >
        <View
          className="w-full flex-row bg-zinc-900 p-4 rounded-lg border
        border-zinc-800 gap-2"
        >
          <Button
            className="flex-1"
            onPress={() => setOptions("activity")}
            variant={options === "activity" ? "primary" : "secondary"}
          >
            <CalendarRange
              color={
                options === "activity" ? colors.zinc[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button
            className="flex-1"
            onPress={() => setOptions("details")}
            variant={options === "details" ? "primary" : "secondary"}
          >
            <Info
              color={
                options === "details" ? colors.zinc[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar"
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NOME)}
      >
        <View className="gap-2 my-4 ">
          <Input Variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Para onde"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input Variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />

            <Input.Field
              placeholder="Quando"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ide e da volta"
        visible={showModal === MODAL.CALENDAR}
        onClose={() => setShowModal(MODAL.NOME)}
      >
        <View className="gab-4 mt4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />
          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
