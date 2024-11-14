"use client";

import React, { useState, useRef } from "react";
import { X, Check } from "lucide-react";
import { Baby } from "lucide-react";
import useFetchList from "../hooks/useFetchList";
import useSnowflakes from "../hooks/useSnowflakes";
type Snowflake = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
};

export default function SantaSwiperReact() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [naughtyCount, setNaughtyCount] = useState(0);
  const [niceCount, setNiceCount] = useState(0);
  const [decision, setDecision] = useState<"naughty" | "nice" | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { isLoading, listOfChildren, setListOfChildren } = useFetchList();
  const cardRef = useRef<HTMLDivElement>(null);
  useSnowflakes();

  const currentChild = listOfChildren[currentIndex];

  const handleSwipe = async (isNice: boolean) => {
    setDecision(isNice ? "nice" : "naughty");
    setIsExiting(true);

    if (currentIndex >= 0 && currentIndex < listOfChildren.length) {
      const status = isNice ? "nice" : "naughty";
      const currentChild = listOfChildren[currentIndex];

      setListOfChildren((prevChildren) =>
        prevChildren.map((child, index) =>
          index === currentIndex ? { ...child, status } : child
        )
      );

      if (isNice) {
        setNiceCount((prev) => prev + 1);
      } else {
        setNaughtyCount((prev) => prev + 1);
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDecision(null);
        setDragOffset(0);
        setIsExiting(false);
      }, 500);

      try {
        const response = await fetch("/api/update-child-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ childId: currentChild._id, status }),
        });

        if (!response.ok) {
          throw new Error("Failed to update status");
        }
      } catch (error) {
        console.error("Error updating child status:", error);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX - dragOffset);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    const currentPosition = e.clientX;
    const newOffset = currentPosition - dragStart;
    setDragOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (dragStart === null) return;
    setDragStart(null);

    if (dragOffset > 100) {
      handleSwipe(true);
    } else if (dragOffset < -100) {
      handleSwipe(false);
    } else {
      setDragOffset(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX - dragOffset);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const currentPosition = e.touches[0].clientX;
    const newOffset = currentPosition - dragStart;
    setDragOffset(newOffset);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const dragPercentage =
    (dragOffset / (cardRef.current?.offsetWidth || 1)) * 100;

  const isLastCard = currentChild && currentIndex === listOfChildren.length - 1;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const createSnowflake = (id: number): Snowflake => ({
    id,
    x: Math.random() * 100,
    y: -10,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 1,
  });

  return (
    <div className="relative flex flex-col items-center min-h-screen">
      <h1 className="top-8 left-1/2 z-50 fixed mx-auto w-full max-w-3xl font-bold text-4xl text-center text-red-600 -translate-x-1/2">
        Naughty or Nice?
      </h1>

      {currentChild ? (
        <div className="relative mt-24">
          {isLastCard && (
            <div className="-top-4 left-1/2 z-10 absolute bg-orange-500 shadow-md px-3 py-1 rounded-full font-semibold text-sm text-white -translate-x-1/2">
              Final Child
            </div>
          )}
          <div
            ref={cardRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-80 h-96 bg-white rounded-lg shadow-lg overflow-hidden relative cursor-grab active:cursor-grabbing
            ${
              decision === "naughty"
                ? "bg-red-100"
                : decision === "nice"
                  ? "bg-green-100"
                  : "bg-white"
            }
            ${isLastCard ? "ring-2 ring-orange-500" : ""}
            ${isExiting ? (decision === "nice" ? "translate-x-[400%] rotate-12" : "translate-x-[-400%] -rotate-12") : ""}
            transition-all duration-500 ease-out`}
            style={{
              transform:
                dragStart !== null
                  ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`
                  : undefined,
              transition:
                dragStart === null
                  ? "transform 0.3s ease-out, translate 0.5s ease-out, rotate 0.5s ease-out"
                  : "none",
            }}
          >
            <div className="flex flex-col justify-between p-6 h-full">
              {currentChild && (
                <>
                  <div className="text-center">
                    <div
                      className="mb-4 text-6xl text-gray-300"
                      aria-hidden="true"
                    >
                      {currentChild.name[0].toUpperCase()}
                    </div>
                    <h2 className="font-semibold text-2xl text-gray-800">
                      {currentChild.name}
                    </h2>
                    <p className="text-gray-600">Age: {currentChild.age}</p>
                    {isLastCard && (
                      <p className="mt-2 font-medium text-orange-500 text-sm">
                        Last child on the list!
                      </p>
                    )}
                  </div>
                  <Baby className="mx-auto size-24" />
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-gray-700">
                      Recent Deed:
                    </h3>

                    {currentChild.deeds.map((deed) => (
                      <p className="text-gray-600">{deed.description}</p>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div
              className="left-0 absolute inset-y-0 flex justify-center items-center bg-red-500 w-12"
              style={{
                opacity: Math.max(-dragPercentage / 50, 0),
                transform: `translateX(${Math.min(-dragOffset / 2, 0)}px)`,
              }}
            >
              <X className="w-8 h-8 text-white" />
            </div>
            <div
              className="right-0 absolute inset-y-0 flex justify-center items-center bg-green-500 w-12"
              style={{
                opacity: Math.max(dragPercentage / 50, 0),
                transform: `translateX(${Math.max(-dragOffset / 2, 0)}px)`,
              }}
            >
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0">
          <div className="absolute inset-0 snow-container overflow-hidden pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animationDelay: `${Math.random() * 5}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                }}
              />
            ))}
          </div>
          <div className="relative z-20 flex flex-col justify-center items-center min-h-screen">
            <div className="bg-gray-100/90 shadow-lg mx-auto mt-24 p-6 rounded-lg w-80 h-96 text-center">
              <div className="mb-4 text-6xl">🎄</div>
              <h2 className="mb-4 font-bold text-2xl text-gray-800">
                All Done!
              </h2>
              <p className="text-gray-600">
                You've judged all the children on the list
              </p>
              <div className="mt-8">
                <p className="font-semibold">Final Count:</p>
                <p className="text-green-600">Nice: {niceCount}</p>
                <p className="text-red-600">Naughty: {naughtyCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
