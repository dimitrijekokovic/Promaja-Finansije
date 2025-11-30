"use client";

import { DeleteCategory } from "@/app/(dashboard)/_actions/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Category } from "@prisma/client";
import { TransactionType } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  category: Category;
}

function DeleteCategoryDialog({ category, trigger }: Props) {
  const categoryIdentifier = `${category.name}-${category.type}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteCategory,
    onSuccess: async () => {
      toast.success("Kategorija uspesno obrisana", {
        id: categoryIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: () => {
      toast.error("Nesto lose se desilo", {
        id: categoryIdentifier,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li si siguran?</AlertDialogTitle>
          <AlertDialogDescription>
            Ova akcija ne moze biti vracena, zauvek ce izbrisati tvoju
            kategoriju
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Otkazi</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Brisanje kategorije...", {
                id: categoryIdentifier,
              });
              deleteMutation.mutate({
                name: category.name,
                type: category.type as TransactionType,
              });
            }}
          >
            Nastavi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategoryDialog;
