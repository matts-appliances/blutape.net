import styles from "./Card.module.css";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import MachineActions from "./MachineActions";
import MachineStatusBadge from "./MachineStatusBadge";
import MachineNotes from "./MachineNotes";
import MachineDetailsForm from "./MachineDetailsForm";
import { useMachineCard } from "./useMachineCard";
import {
  faPenToSquare,
  faPrint,
  faRecycle,
  faRotateLeft,
  faScrewdriverWrench,
  faSquareCheck,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

const Card = () => {
  const { id } = useParams();
  const {
    machine,
    editing,
    setEditing,
    formData,
    noteContent,
    setNoteContent,
    printLabel,
    handleChange,
    handleStatusChange,
    handleSubmit,
  } = useMachineCard(id);

  const actions = useMemo(() => {
    const statusActions = {
      in_progress: [
        {
          icon: faSquareCheck,
          className: styles.completeMachine,
          onClick: () => handleStatusChange("completed"),
        },
        {
          icon: editing.machine ? faRotateLeft : faPenToSquare,
          className: styles.editMachine,
          onClick: () =>
            setEditing({ machine: !editing.machine, notes: false }),
        },
        {
          icon: faTrashCan,
          className: styles.trashMachine,
          onClick: () => handleStatusChange("trashed"),
        },
      ],
      completed: [
        {
          icon: faScrewdriverWrench,
          className: styles.restoreMachine,
          onClick: () => handleStatusChange("in_progress"),
        },
        {
          icon: faTrashCan,
          className: styles.trashMachine,
          onClick: () => handleStatusChange("trashed"),
        },
      ],
      trashed: [
        {
          icon: faRecycle,
          className: styles.recycleMachine,
          onClick: () => handleStatusChange("in_progress"),
        },
      ],
    };

    const printButton = {
      icon: faPrint,
      className: styles.printMachine,
      onClick: printLabel,
      disabled: false,
    };

    return [printButton, ...(statusActions[machine.current_status] || [])];
  }, [
    editing.machine,
    handleStatusChange,
    machine.current_status,
    printLabel,
    setEditing,
  ]);

  if (!machine) {
    return (
      <div className={styles.cardMissing}>
        <h2>Machine not found</h2>
      </div>
    );
  }

  return (
    <div className={styles.cardPage}>
      <div className={styles.cardHeader}>
        <MachineActions actions={actions} />
      </div>
      <div className={styles.statusCard}>
        <MachineStatusBadge currentStatus={machine.current_status} />
      </div>
      <MachineDetailsForm
        machine={machine}
        editingMachine={editing.machine}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <MachineNotes
        editing={editing}
        setEditing={setEditing}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        handleSubmit={handleSubmit}
        notes={machine.notes}
      />
    </div>
  );
};

export default Card;
