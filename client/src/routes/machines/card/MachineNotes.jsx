import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenClip, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "./Card.module.css";
import { formatDate } from "../../../utils/Tools";

const MachineNotes = ({
  editing,
  setEditing,
  noteContent,
  setNoteContent,
  handleSubmit,
  notes,
}) => {
  const safeNotes = Array.isArray(notes) ? notes : [];

  return (
    <div className={styles.notesBlock}>
      <h3>
        Notes{" "}
        <button
          className={styles.noteToggle}
          onClick={() =>
            setEditing({ ...editing, notes: !editing.notes, machine: false })
          }
          type="button"
        >
          <FontAwesomeIcon icon={editing.notes ? faRotateLeft : faPenClip} />
          <span>{editing.notes ? "Close" : "Add Note"}</span>
        </button>
      </h3>
      <ul>
        {editing.notes && (
          <li className={styles.addNote}>
            <form onSubmit={handleSubmit}>
              <textarea
                name="note"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                autoFocus
              ></textarea>
              <button type="submit">Add Note</button>
            </form>
          </li>
        )}
        {safeNotes.length === 0 ? (
          <li className={styles.emptyNote}>
            <p>No notes yet. Add one to start the timeline.</p>
          </li>
        ) : (
          <>
            {safeNotes
              .slice()
              .reverse()
              .map(({ id, content, added_on, technician }) => {
                return (
                  <li key={id}>
                    <p>{content}</p>
                    <p>
                      <small>
                        {technician.first_name} {technician.last_name[0]}.
                      </small>
                    </p>
                    <p className={styles.noteDate}>{formatDate(added_on)}</p>
                  </li>
                );
              })}
          </>
        )}
      </ul>
    </div>
  );
};

export default MachineNotes;
