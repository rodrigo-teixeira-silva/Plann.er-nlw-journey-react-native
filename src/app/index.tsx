import { useState } from "react";
import { View, Text, Image, Keyboard, Alert } from "react-native";
import {
  MapPin,
  Calendar as IconCalendar,
  Settings2,
  UserRoundPlus,
  ArrowRight,
  AtSign,
  SignalZero,
} from "lucide-react-native";
import { DateData } from "react-native-calendars";
import dayjs from "dayjs";

import { tripStorage } from "@/storage/trip";
import { tripServer } from "@/server/trip-server";

import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";

import { Modal } from "@/components/modal";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { GuestEmail } from "@/components/email";
import { router } from "expo-router";

enum StepForm {
  TRIP_DETAIL = 1,
  ADD_EMAIL = 2,
}

export default function App() {
  // LOADING
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  // DATA
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAIL);
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [destination, setDestination] = useState("");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailsToInvite, setEmailsToInvite] = useState<String[]>([]);

  enum MODAL {
    NOME = 0,
    CALENDAR = 1,
    GUEST = 2,
  }

  // MODAL
  const [showModal, setShowModal] = useState(MODAL.NOME);

  function handleNextStepForm() {
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        "Detalhes da viagem",
        "Preencha toda as informaçoes da viagem para seguir"
      );
    }

    if (destination.length < 4) {
      return Alert.alert(
        "Detalhes da viagem",
        "O destino deve ter mais de 4 caracteres."
      );
    }

    if (stepForm === StepForm.TRIP_DETAIL) {
      return setStepForm(StepForm.ADD_EMAIL);
    }
    Alert.alert("Nova viagem", "Confirmar viagem?", [
      {
        text: "Não",
        style: "cancel",
      },

      {
        text: "Sim",
        onPress: createTrip,
      },
    ]);
  }

  function handleSelectDate(selected: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay: selected,
    });

    setSelectedDates(dates);
  }

  function handleRemoveEmail(emailToRemove: String) {
    setEmailsToInvite((prevState) =>
      prevState.filter((email) => email !== emailToRemove)
    );
  }

  function handleAddEmail() {
    if (!validateInput.email(emailToInvite)) {
      return Alert.alert("Convidado", "E-mail inválido");
    }

    const emailAlreadExists = emailsToInvite.find(
      (email) => email === emailToInvite
    );
    if (emailAlreadExists) {
      return Alert.alert("Convidado", "E-mail ja foi adicionado");
    }
    setEmailsToInvite((prevState) => [...prevState, emailToInvite]);
    setEmailToInvite("");
  }

  async function saveTrip(tripId: string) {
    try {
      await tripStorage.save(tripId);
      router.navigate("/trip" + tripId);
    } catch (error) {
      Alert.alert(
        "Salavar viagem",
        "Não foi possível salvar o id da viagem no dispositivo."
      );
      console.log(error);
    }
  }

  async function createTrip() {
    try {
      setIsCreatingTrip(true);

      const newTrip = await tripServer.create({
        destination,
        start_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        emails_to_invite: emailsToInvite,
      });

      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        {
          text: "Ok. Continuar.",
          onPress: () => saveTrip(newTrip.tripId),
        },
      ]);
    } catch (error) {
      console.log(error);
      setIsCreatingTrip(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Image
        source={require("@/assets/logo.png")}
        className="h-8"
        resizeMode="contain"
      />

      <Image source={require("@/assets/bg.png")} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e planeje sua {"\n"} próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-1 rounded-xl my-8 border border-zinc-800">
        <Input Variant="primary">
          <MapPin color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Para onde?"
            editable={stepForm === StepForm.TRIP_DETAIL}
            onChangeText={setDestination}
            value={destination}
          />
        </Input>

        <Input Variant="primary">
          <IconCalendar color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="quando?"
            editable={stepForm === StepForm.TRIP_DETAIL}
            onFocus={() => Keyboard.dismiss()}
            showSoftInputOnFocus={false}
            onPress={() =>
              stepForm === StepForm.TRIP_DETAIL && setShowModal(MODAL.CALENDAR)
            }
            value={selectedDates.formatDatesInText}
          />
        </Input>

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b py-1 border-zinc-800">
              <Button
                variant="secondary"
                onPress={() => setStepForm(StepForm.TRIP_DETAIL)}
              >
                <Button.Title>Alterar local/data</Button.Title>
                <Settings2 color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input Variant="primary">
              <UserRoundPlus color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder="Quem estara na viagem"
                autoCorrect={false}
                value={
                  emailsToInvite.length > 0
                    ? `${emailsToInvite.length} pessoas(s) convidadas(s)`
                    : ""
                }
                onPress={() => {
                  Keyboard.dismiss();
                  setShowModal(MODAL.GUEST);
                }}
                showSoftInputOnFocus={false}
              />
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAIL
              ? "Continuar"
              : "Confirmar viagem"}
          </Button.Title>
          <ArrowRight color={colors.lime[950]} size={20} />
        </Button>
      </View>
      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem plan.er você automaticamente concorda com nosso
        nossos{" "}
        <Text className="text-zinc-300 underline">
          termos de uso e política de privacidade.
        </Text>
      </Text>
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
          <Button onPress={() => setShowModal(MODAL.NOME)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a 
     participação na viagem"
        visible={showModal === MODAL.GUEST}
        onClose={() => setShowModal(MODAL.NOME)}
      >
        <View
          className="my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 
      items-start"
        >
          {emailsToInvite.length > 0 ? (
            emailsToInvite.map((email) => (
              <GuestEmail
                key={"email"}
                email={"email "}
                onRemove={() => handleRemoveEmail(email)}
              />
            ))
          ) : (
            <Text className="text-zinc-600 text-base font-regular">
              Nenhum e-mail adicionado.
            </Text>
          )}
        </View>

        <View className="gap-4 mt-4">
          <Input Variant="secondary">
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="digite o e-mail do convidado"
              keyboardType="email-address"
              onChangeText={(text) =>
                setEmailToInvite(text.toLocaleLowerCase())
              }
              value={emailToInvite}
              returnKeyType="send"
              onSubmitEditing={handleAddEmail}
            />
          </Input>

          <Button onPress={handleAddEmail}>
            <Button.Title>Convidar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
