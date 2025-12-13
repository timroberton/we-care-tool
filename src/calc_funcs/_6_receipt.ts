import type { ResultsReceipt } from "~/types/mod";
import { assert, assertNotUndefined } from "panther";
import { type Service } from "~/config/services";

export function calculateReceipt(
  services: Service[],
  itemReadiness: Record<string, number>,
  numberArrivingAtFacility: number
): ResultsReceipt {
  const hwAvailability = Math.max(0, Math.min(1, itemReadiness["hw"] ?? 0));
  const receiptMixture = 1 - hwAvailability;

  if (receiptMixture <= 0) {
    return calculateReceiptIdeal(
      services,
      itemReadiness,
      numberArrivingAtFacility
    );
  }
  if (receiptMixture >= 1) {
    return calculateReceiptNaive(
      services,
      itemReadiness,
      numberArrivingAtFacility
    );
  }

  // Mix between ideal and naive methods
  // Mixture is based on HW availability - more HWs = more ideal allocation
  const idealReceipt = calculateReceiptIdeal(
    services,
    itemReadiness,
    numberArrivingAtFacility
  );
  const naiveReceipt = calculateReceiptNaive(
    services,
    itemReadiness,
    numberArrivingAtFacility
  );

  const receipt: ResultsReceipt = {};

  for (const service of services) {
    const idealP = idealReceipt[service.id]?.p || 0;
    const naiveP = naiveReceipt[service.id]?.p || 0;
    const mixedP = idealP * (1 - receiptMixture) + naiveP * receiptMixture;

    receipt[service.id] = {
      p: mixedP,
      n: numberArrivingAtFacility * mixedP,
    };
  }

  const idealNoAbortion = idealReceipt.noAbortion?.p || 0;
  const naiveNoAbortion = naiveReceipt.noAbortion?.p || 0;
  const mixedNoAbortion =
    idealNoAbortion * (1 - receiptMixture) + naiveNoAbortion * receiptMixture;

  receipt.noAbortion = {
    p: mixedNoAbortion,
    n: numberArrivingAtFacility * mixedNoAbortion,
  };

  return receipt;
}

function calculateReceiptIdeal(
  services: Service[],
  itemReadiness: Record<string, number>,
  numberArrivingAtFacility: number
): ResultsReceipt {
  const receipt: ResultsReceipt = {};
  let totalServiceReceipt = 0;

  const currentItemReadiness = { ...itemReadiness };

  // Calculate receipt for each service using greedy allocation
  // Services are processed in array order, which represents priority
  // Higher-priority services get first access to limited item availability
  for (const service of services) {
    let pServiceReceipt = 0;
    for (const componentCombo of service.componentCombos) {
      const specificItemAvailability = componentCombo.map((component) => {
        const pComponent = currentItemReadiness[component];
        assertNotUndefined(pComponent);
        return pComponent;
      });
      const minAvailability = Math.min(...specificItemAvailability);
      pServiceReceipt += minAvailability;

      for (const itemId in currentItemReadiness) {
        currentItemReadiness[itemId] = Math.max(
          0,
          currentItemReadiness[itemId] - minAvailability
        );
      }
    }
    receipt[service.id] = {
      p: pServiceReceipt,
      n: numberArrivingAtFacility * pServiceReceipt,
    };
    totalServiceReceipt += pServiceReceipt;
  }

  // Calculate "no abortion" for the remainder
  const pNoAbortion = 1 - totalServiceReceipt;
  assert(pNoAbortion >= 0);
  receipt.noAbortion = {
    p: pNoAbortion,
    n: numberArrivingAtFacility * pNoAbortion,
  };

  return receipt;
}

function calculateReceiptNaive(
  services: Service[],
  itemReadiness: Record<string, number>,
  numberArrivingAtFacility: number
): ResultsReceipt {
  const receipt: ResultsReceipt = {};

  // Step 1: Calculate each service's potential score (max % that could receive it)
  // without considering resource consumption
  const servicePotentials: Array<{
    service: Service;
    score: number;
  }> = [];

  for (const service of services) {
    let maxScore = 0;

    for (const combo of service.componentCombos) {
      const comboScore = Math.min(
        ...combo.map((itemId) => {
          const p = itemReadiness[itemId];
          assertNotUndefined(p);
          return p;
        })
      );
      maxScore = Math.max(maxScore, comboScore);
    }

    servicePotentials.push({ service, score: maxScore });
  }

  // Step 2: Calculate total score
  const totalScore = servicePotentials.reduce((sum, sp) => sum + sp.score, 0);

  // Step 3: Normalize so that total service receipt equals actual capacity
  // Use ideal method to determine actual capacity
  const idealReceipt = calculateReceiptIdeal(
    services,
    itemReadiness,
    numberArrivingAtFacility
  );

  const actualCapacity = services.reduce(
    (sum, service) => sum + (idealReceipt[service.id]?.p || 0),
    0
  );

  // Step 4: Allocate proportionally based on scores, scaled to actual capacity
  let totalServiceReceipt = 0;

  for (const { service, score } of servicePotentials) {
    const p = totalScore > 0 ? (score / totalScore) * actualCapacity : 0;
    receipt[service.id] = {
      p,
      n: numberArrivingAtFacility * p,
    };
    totalServiceReceipt += p;
  }

  // Calculate "no abortion" for the remainder
  const pNoAbortion = Math.max(0, 1 - totalServiceReceipt);
  receipt.noAbortion = {
    p: pNoAbortion,
    n: numberArrivingAtFacility * pNoAbortion,
  };

  return receipt;
}
