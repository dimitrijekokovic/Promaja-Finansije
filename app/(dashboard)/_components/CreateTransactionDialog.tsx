"use client";

import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { useMediaQuery } from "@/hooks/use-mobile";

interface Props {
  trigger: ReactNode;
  type: TransactionType; // "prihod" | "rashod" i da se poklapa sa šemom
}

export default function CreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema) as any,
    defaultValues: {
      type,
      description: "",
      amount: 0,
      date: new Date(),
      category: undefined,
    },
  });

  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transakcija uspesno kreirana!", {
        id: "create-transaction",
      });
      form.reset({
        type,
        description: "",
        amount: 0,
        date: new Date(),
        category: undefined,
      });

      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });

      setOpen(false);
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Kreiram transakciju...", {
        id: "create-transaction",
      });

      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );

  // zajednički sadržaj forme (isti i za Dialog i za Drawer)
  const formNode = (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Opis transakcije (opciono)</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Iznos</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>Iznos transakcije (obavezno)</FormDescription>
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Kategorija</FormLabel>
                <FormControl>
                  <CategoryPicker type={type} onChange={handleCategoryChange} />
                </FormControl>
                <FormDescription>
                  Izaberi kategoriju za transakciju
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Datum transakcije</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[200px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Izaberi datum</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(value) => {
                        if (!value) return;
                        field.onChange(value);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormDescription>Izaberi datum</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  const footerButtons = (
    <>
      <Button
        type="button"
        variant={"secondary"}
        onClick={() => {
          form.reset();
          setOpen(false);
        }}
      >
        Otkazi
      </Button>
      <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
        {!isPending && "Napravi"}
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    </>
  );

  // DESKTOP: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Napravi novu{" "}
              <span
                className={cn(
                  "m-1",
                  type === "prihod" ? "text-emerald-500" : "text-red-500"
                )}
              >
                {type}
              </span>{" "}
              transakciju
            </DialogTitle>
          </DialogHeader>

          {formNode}

          <DialogFooter>
            <DialogClose asChild>{footerButtons}</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // MOBILNI: Drawer (bottom sheet)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="px-4 pb-4">
        <DrawerHeader className="text-left">
          <DrawerTitle>
            Napravi novu{" "}
            <span
              className={cn(
                "m-1",
                type === "prihod" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {type}
            </span>{" "}
            transakciju
          </DrawerTitle>
        </DrawerHeader>

        <div className="mt-2 max-h-[70vh] space-y-6 overflow-y-auto">
          {formNode}
        </div>

        <DrawerFooter className="flex flex-row gap-2">
          <DrawerClose asChild>{footerButtons}</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
