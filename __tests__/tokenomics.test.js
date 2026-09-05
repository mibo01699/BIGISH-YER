const path = require('path');

const MODULE_PATH = path.resolve(__dirname, '../YERTokenomicsCanonical.js');

function loadFresh(env = {}) {
  const previous = process.env.YER_LAUNCHPAD_STATUS;
  if (env.YER_LAUNCHPAD_STATUS === undefined) {
    delete process.env.YER_LAUNCHPAD_STATUS;
  } else {
    process.env.YER_LAUNCHPAD_STATUS = env.YER_LAUNCHPAD_STATUS;
  }
  delete require.cache[MODULE_PATH];
  const mod = require(MODULE_PATH);
  return {
    mod,
    restore() {
      if (previous === undefined) delete process.env.YER_LAUNCHPAD_STATUS;
      else process.env.YER_LAUNCHPAD_STATUS = previous;
    },
  };
}

describe('YERTokenomicsCanonical', () => {
  const tokenomics = require(MODULE_PATH);

  describe('supply and allocations', () => {
    it('exposes the canonical symbol, precision and max supply as BigInt', () => {
      expect(tokenomics.symbol).toBe('YER');
      expect(tokenomics.precision).toBe(10);
      expect(typeof tokenomics.maximumSupply).toBe('bigint');
      expect(tokenomics.maximumSupply).toBe(300000000n);
    });

    it('has the 10 / 30 / 60 allocation split', () => {
      expect(tokenomics.allocations.communityPublicUtility).toBe(30000000n);
      expect(tokenomics.allocations.ecosystemLaunchLiquidity).toBe(90000000n);
      expect(tokenomics.allocations.aecSovereignReserve).toBe(180000000n);
    });

    it('allocations sum exactly to the maximum supply', () => {
      const total = Object.values(tokenomics.allocations).reduce((sum, v) => sum + v, 0n);
      expect(total).toBe(tokenomics.maximumSupply);
    });

    it('percentages sum to 100 and match the allocations', () => {
      const pct = tokenomics.allocationPercentages;
      expect(pct.communityPublicUtility + pct.ecosystemLaunchLiquidity + pct.aecSovereignReserve).toBe(100);

      for (const key of Object.keys(pct)) {
        const expected = (tokenomics.maximumSupply * BigInt(pct[key])) / 100n;
        expect(tokenomics.allocations[key]).toBe(expected);
      }
    });

    it('matches the values declared in the environment contract', () => {
      expect(tokenomics.maximumSupply.toString()).toBe('300000000');
      expect(tokenomics.allocations.communityPublicUtility.toString()).toBe('30000000');
      expect(tokenomics.allocations.ecosystemLaunchLiquidity.toString()).toBe('90000000');
      expect(tokenomics.allocations.aecSovereignReserve.toString()).toBe('180000000');
    });
  });

  describe('launch gating', () => {
    afterEach(() => {
      delete require.cache[MODULE_PATH];
    });

    it('defaults to PENDING and locks the community allocation', () => {
      const { mod, restore } = loadFresh({});
      try {
        expect(mod.getLaunchStatus()).toBe('PENDING');
        expect(mod.isLaunchpadDeployed()).toBe(false);
        expect(mod.canReleaseCommunityAllocation()).toBe(false);
      } finally {
        restore();
      }
    });

    it('unlocks the community allocation only on DEPLOYED_SUCCESS', () => {
      const { mod, restore } = loadFresh({ YER_LAUNCHPAD_STATUS: 'DEPLOYED_SUCCESS' });
      try {
        expect(mod.isLaunchpadDeployed()).toBe(true);
        expect(mod.canReleaseCommunityAllocation()).toBe(true);
      } finally {
        restore();
      }
    });

    it.each(['deployed_success', 'DEPLOYED', 'SUCCESS', 'FAILED', ''])(
      'treats status "%s" as not deployed',
      (status) => {
        const { mod, restore } = loadFresh({ YER_LAUNCHPAD_STATUS: status });
        try {
          expect(mod.canReleaseCommunityAllocation()).toBe(false);
        } finally {
          restore();
        }
      },
    );

    it('always allows mining of the ecosystem allocation', () => {
      expect(tokenomics.canMineEcosystemAllocation()).toBe(true);
    });
  });
});
