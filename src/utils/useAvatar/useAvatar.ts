import useParticipants from '../../hooks/useParticipants/useParticipants';

export default function useAvatar(conversation) {
  const participants = useParticipants();
  console.log(conversation)
  console.log(participants)

  return null
}
