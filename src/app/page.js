'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

function CardModal({ card, onClose, onSave }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  function handleTitleChange(e) {
    const newTitle = e.target.value;
    if (newTitle.trim().length > 0) {
      setTitle(newTitle);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 text-white p-6 rounded-lg w-1/2" onClick={(e) => e.stopPropagation()}>
        <input
          className="w-full text-2xl font-bold mb-4 bg-gray-700 p-2 rounded text-white"
          value={title}
          onChange={handleTitleChange}
        />
        <textarea
          className="w-full p-2 bg-gray-700 rounded mb-4"
          rows="5"
          placeholder="Ajouter une description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => onSave({ title, description })}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableListTitle({ title, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  function handleTitleChange(e) {
    setCurrentTitle(e.target.value);
  }

  function handleBlur() {
    if (currentTitle.trim().length > 0) {
      onSave(currentTitle);
    }
    setIsEditing(false);
  }

  return isEditing ? (
    <input
      className="w-[calc(100%-2rem)] text-xl font-semibold mb-2 bg-gray-700 p-2 rounded text-white"
      value={currentTitle}
      onChange={handleTitleChange}
      onBlur={handleBlur}
      autoFocus
    />
  ) : (
    <h2
      className="text-xl font-semibold mb-2 cursor-pointer text-white"
      onClick={() => setIsEditing(true)}
    >
      {title}
    </h2>
  );
}

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const optionRefs = useRef([]);

  function addBoard() {
    const title = prompt("Nom de la liste :");
    if (!title) return;
    setBoards([...boards, { title, cards: [] }]);
  }

  function addCard(boardIndex) {
    const text = prompt("Nom de la carte :");
    if (!text) return;
    const newBoards = [...boards];
    if (!newBoards[boardIndex].cards) {
      newBoards[boardIndex].cards = []; // S'assurer que la liste des cartes existe
    }
    newBoards[boardIndex].cards.push({ title: text });
    setBoards(newBoards);
  }

  function editCard(boardIndex, cardIndex) {
    const newText = prompt("Modifier le nom de la carte :");
    if (!newText) return;
    const newBoards = [...boards];
    newBoards[boardIndex].cards[cardIndex].title = newText;
    setBoards(newBoards);
  }

  function editBoard(boardIndex) {
    const newTitle = prompt("Modifier le nom de la liste :");
    if (!newTitle) return;
    const newBoards = [...boards];
    newBoards[boardIndex].title = newTitle;
    setBoards(newBoards);
  }

  function deleteBoard(boardIndex) {
    const newBoards = boards.filter((_, index) => index !== boardIndex);
    setBoards(newBoards);
  }

  function toggleOptions(index) {
    const newBoards = boards.map((board, i) => {
      if (i === index) {
        return { ...board, showOptions: !board.showOptions };
      }
      return { ...board, showOptions: false };
    });
    setBoards(newBoards);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      optionRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          toggleOptions(index);
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [boards]);

  function handleDragStart(e, boardIndex, cardIndex) {
    e.dataTransfer.setData("text/plain", `${boardIndex},${cardIndex}`);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, boardIndex, cardIndex) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const [fromBoardIndex, fromCardIndex] = data.split(",").map(Number);

    if (fromBoardIndex === boardIndex && fromCardIndex === cardIndex) {
      return; // Ne rien faire si le glissement est effectué dans la même carte
    }

    const newBoards = [...boards];
    const draggedCard = newBoards[fromBoardIndex].cards[fromCardIndex];

    // Supprimer la carte de la liste d'origine
    newBoards[fromBoardIndex].cards.splice(fromCardIndex, 1);

    // Ajouter la carte à la nouvelle position
    newBoards[boardIndex].cards.splice(cardIndex, 0, draggedCard);

    setBoards(newBoards);
  }

  function handleDragEnter(e) {
    e.currentTarget.classList.add("bg-zinc-600", "border", "border-dashed", "border-white");
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove("bg-zinc-600", "border", "border-dashed", "border-white");
  }

  function openCardModal(boardIndex, cardIndex) {
    const card = boards[boardIndex].cards[cardIndex];
    setSelectedCard({ ...card, boardIndex, cardIndex });
  }

  return (
    <div className="min-h-screen bg-zinc-700 p-6 text-white">
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <CardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onSave={(details) => {
              const { boardIndex, cardIndex } = selectedCard;
              const newBoards = [...boards];
              newBoards[boardIndex].cards[cardIndex] = details;
              setBoards(newBoards);
              setSelectedCard(null);
            }}
          />
        </div>
      )}
      <div className={`flex items-center gap-2 text-3xl font-bold mb-6 ${selectedCard ? 'pointer-events-none' : ''}`}>
        <img src="/logo.png" alt="Epitrello logo" className="w-10 h-10" />
        <h1>Epitrello</h1>
      </div>

      <div className={`mb-6 ${selectedCard ? 'pointer-events-none' : ''}`}>
        <Button onClick={addBoard}>+ Ajouter une liste</Button>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${selectedCard ? 'pointer-events-none' : ''}`}>
        {boards.map((board, index) => (
          <Card key={index} className="bg-zinc-800">
            <CardContent className="p-4">
              <div className="relative">
                <EditableListTitle
                  title={board.title}
                  onSave={(newTitle) => {
                    const newBoards = [...boards];
                    newBoards[index].title = newTitle;
                    setBoards(newBoards);
                  }}
                />
                <button
                  className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-white hover:bg-gray-700 hover:text-white transition"
                  onClick={() => toggleOptions(index)}
                >
                  ...
                </button>
                {board.showOptions && (
                  <div
                    ref={(el) => (optionRefs.current[index] = el)}
                    className="absolute top-8 right-0 bg-zinc-900 text-black rounded shadow-md p-4 w-48"
                  >
                    <h3 className="text-lg font-bold mb-2 text-white">Fenêtre des options</h3>
                    <ul className="space-y-2">
                      <li>
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => addCard(index)}
                        >
                          Ajouter une carte
                        </button>
                      </li>
                      <li>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => {
                            const newBoards = boards.filter((_, i) => i !== index);
                            setBoards(newBoards);
                          }}
                        >
                          Supprimer la liste
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <ul className="space-y-2 mb-4">
                {board.cards && board.cards.map((card, cIndex) => (
                  <li
                    key={cIndex}
                    className="bg-zinc-700 p-2 rounded shadow-sm cursor-pointer text-white hover:bg-zinc-600 hover:shadow-md transition"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, cIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index, cIndex)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => openCardModal(index, cIndex)}
                  >
                    {card.title}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => addCard(index)}
                className="mt-4 hover:bg-blue-600 hover:text-white transition"
              >
                + Ajouter une carte
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}