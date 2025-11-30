"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Currencies, type Currency } from "@/lib/currencies";
import { useMutation, useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "./SkeletonWrapper";
import type { UserSettings } from "@prisma/client";
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";

export function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    null
  );

  // --- FETCH USER SETTINGS ---
  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  React.useEffect(() => {
    if (!userSettings.data) return;

    const userCurrency = Currencies.find(
      (currency) => currency.value === userSettings.data.currency
    );

    if (userCurrency) setSelectedOption(userCurrency);
  }, [userSettings.data]);

  // --- MUTATION ZA UPDATE VALUTE ---
  const mutation = useMutation({
    mutationFn: UpdateUserCurrency,
    onSuccess: (data: UserSettings) => {
      toast.success("Valuta uspešno ažurirana!", {
        id: "update-currency",
      });

      const newCurrency =
        Currencies.find((c) => c.value === data.currency) || null;
      setSelectedOption(newCurrency);
    },
    onError: () => {
      toast.error("Pojavila se greška!", {
        id: "update-currency",
      });
    },
  });

  // Handler koji se koristi i na desktopu i na mobilnom
  const handleCurrencySelect = React.useCallback(
    (currency: Currency | null) => {
      if (!currency) {
        toast.error("Molim te izaberi valutu");
        return;
      }

      toast.loading("Ažuriram valutu...", {
        id: "update-currency",
      });

      mutation.mutate(currency.value);
    },
    [mutation]
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-center"
              disabled={mutation.isPending}
            >
              {selectedOption ? (
                <>{selectedOption.label}</>
              ) : (
                <>Podesi valutu</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList
              setOpen={setOpen}
              onSelectCurrency={handleCurrencySelect}
            />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  // --- MOBILNI ---
  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-[150px] justify-start"
            disabled={mutation.isPending}
          >
            {selectedOption ? <>{selectedOption.label}</> : <>+ Set status</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList
              setOpen={setOpen}
              onSelectCurrency={handleCurrencySelect}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

// --- LISTA OPCIJA ---

function OptionList({
  setOpen,
  onSelectCurrency,
}: {
  setOpen: (open: boolean) => void;
  onSelectCurrency: (currency: Currency | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter valuta..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency: Currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                const selected =
                  Currencies.find((c) => c.value === value) || null;

                onSelectCurrency(selected);
                setOpen(false);
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
