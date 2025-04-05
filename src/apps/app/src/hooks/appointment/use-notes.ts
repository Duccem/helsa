export const useNotes = () => {
  const createNote = async ({ appointmentId, note }: { appointmentId: string; note: string }) => {
    const response = await fetch(`/api/v1/appointment/${appointmentId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    });
    if (!response.ok) {
      throw new Error('Error creating note');
    }
    return response.json();
  };

  return {
    createNote,
  };
};
